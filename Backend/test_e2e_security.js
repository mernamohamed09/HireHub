const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const assert = require('assert');

async function testE2E() {
  console.log('=== RUNNING FULL END-TO-END SECURITY VERIFICATION ===');
  let passed = 0;
  let failed = 0;

  function report(success, title) {
    if (success) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      failed++;
    }
  }

  // 1. Health Checks
  try {
    const backendHealth = await fetch('http://127.0.0.1:5000/api/health').then(r => r.json());
    report(backendHealth.success === true && backendHealth.database === 'connected', 'Backend health check returns database connected');

    const aiHealth = await fetch('http://127.0.0.1:8008/health').then(r => r.json());
    report(aiHealth.success === true && aiHealth.models_ready === true, 'AI microservice health check returns models ready');

    const frontendStatus = await fetch('http://localhost:5173/').then(r => r.status);
    report(frontendStatus === 200, 'Frontend Vite dev server returns HTTP 200');
  } catch (e) {
    report(false, `Health check failed: ${e.message}`);
  }

  // 2. Registration with Weak Password vs Strong Password
  const candidateEmail = `test_cand_${Date.now()}@example.com`;
  const companyEmail = `test_comp_${Date.now()}@example.com`;

  try {
    const weakReg = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Cand',
        email: candidateEmail,
        password: 'weak',
        role: 'candidate'
      })
    });
    report(weakReg.status === 400, 'Registration with weak password (<8 chars) returns HTTP 400');

    const strongReg = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Candidate User',
        email: candidateEmail,
        password: 'StrongCandidatePass123!',
        role: 'candidate'
      })
    });
    const strongRegData = await strongReg.json();
    report(strongReg.status === 201 && strongRegData.success === true, 'Registration with strong password returns HTTP 201 Created');

    // Register company user
    const compReg = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Company User',
        email: companyEmail,
        password: 'StrongCompanyPass123!',
        role: 'company'
      })
    });
    const compRegData = await compReg.json();
    report(compReg.status === 201, 'Company registration returns HTTP 201 Created');

    // 3. Login
    const candLogin = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: candidateEmail,
        password: 'StrongCandidatePass123!'
      })
    });
    const candLoginData = await candLogin.json();
    const candToken = candLoginData.token;
    report(candLogin.status === 200 && candToken !== undefined, 'Candidate login returns HTTP 200 with JWT token');

    const compLogin = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: companyEmail,
        password: 'StrongCompanyPass123!'
      })
    });
    const compLoginData = await compLogin.json();
    const compToken = compLoginData.token;
    report(compLogin.status === 200 && compToken !== undefined, 'Company login returns HTTP 200 with JWT token');

    // 4. Authenticated Request using Redis status check
    const meRes = await fetch('http://127.0.0.1:5000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${candToken}` }
    });
    const meData = await meRes.json();
    report(meRes.status === 200 && meData.user.email === candidateEmail, 'GET /api/users/profile returns authenticated user profile');

    // 5. Post Job as Company
    const jobRes = await fetch('http://127.0.0.1:5000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${compToken}`
      },
      body: JSON.stringify({
        title: 'Senior Software Engineer',
        description: 'We need a senior full-stack developer with Node.js and Python experience.',
        company: 'Tech Solutions Inc',
        location: 'Remote',
        salary: 100000
      })
    });
    const jobData = await jobRes.json();
    report(jobRes.status === 201 && jobData.job !== undefined, 'POST /api/jobs creates a new job');
    const jobId = jobData.job?._id;

    // 6. Test Optional Auth on Inactive Job (TASK-AUTHZ-03)
    // Deactivate the job
    const updateJobRes = await fetch(`http://127.0.0.1:5000/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${compToken}`
      },
      body: JSON.stringify({ isActive: false })
    });
    report(updateJobRes.status === 200, 'Company deactivates job (isActive: false)');

    // Anonymous request to inactive job -> 404
    const anonJobRes = await fetch(`http://127.0.0.1:5000/api/jobs/${jobId}`);
    report(anonJobRes.status === 404, 'Anonymous request to inactive job returns HTTP 404 (IDOR / Inactive protection)');

    // Other candidate request to inactive job -> 404
    const otherCandJobRes = await fetch(`http://127.0.0.1:5000/api/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${candToken}` }
    });
    report(otherCandJobRes.status === 404, 'Non-owner candidate request to inactive job returns HTTP 404');

    // Owner company request to inactive job -> 200
    const ownerJobRes = await fetch(`http://127.0.0.1:5000/api/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${compToken}` }
    });
    report(ownerJobRes.status === 200, 'Owner recruiter request to inactive job returns HTTP 200 via optionalAuthMiddleware');

    // 7. Test AI Microservice Fail-Closed Key Protection from Backend
    const aiService = require('./services/aiService');
    const aiScore = await aiService.analyzeApplication({
      cvText: 'Senior Software Engineer with 6 years experience in Python, Node.js, React, Docker, and system architecture.',
      jobTitle: 'Senior Software Engineer',
      jobDescription: 'Seeking Senior Full-Stack Engineer skilled in Node.js, Python, and React.'
    });
    report(aiScore.success === true && typeof aiScore.matchScore === 'number', `AI microservice scored resume successfully: ${aiScore.matchScore}% match`);

    // 8. Test Assessment Validation (TASK-INT-05)
    const malformedExam = await fetch(`http://127.0.0.1:5000/api/jobs/${jobId}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${compToken}`
      },
      body: JSON.stringify({
        title: 'Ex', // too short (<3)
        duration: 1, // too short (<5)
        passingScore: 120, // > 100
        questions: []
      })
    });
    report(malformedExam.status === 400, 'POST /jobs/:id/assessments rejects malformed payload with HTTP 400');

    // 9. Test Suspension & Redis-Backed Real-Time Invalidation (TASK-AUTH-01)
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const redis = require('./utils/redisClient');

    await mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/hirehub');
    await User.findByIdAndUpdate(candLoginData.user._id, { isActive: false });
    if (redis.status === 'ready') {
      await redis.del(`user:status:${candLoginData.user._id}`);
    }

    const suspendedRes = await fetch('http://127.0.0.1:5000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${candToken}` }
    });
    report(suspendedRes.status === 403, 'Suspended user immediately receives HTTP 403 on API request');

    // Clean up
    await User.findByIdAndDelete(candLoginData.user._id);
    await User.findByIdAndDelete(compLoginData.user._id);
    await mongoose.disconnect();
    redis.disconnect();

  } catch (e) {
    report(false, `E2E flow failed with error: ${e.message}`);
  }

  console.log(`\n=== E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

testE2E();
