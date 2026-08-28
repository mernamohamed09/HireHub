const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redis = require('./utils/redisClient');
const User = require('./models/User');
const Job = require('./models/jobs');
const Application = require('./models/application');
const CandidateProfile = require('./models/candidate');
const CompanyProfile = require('./models/company');
const Interview = require('./models/interview');
const Notification = require('./models/notification');
const { createAssessmentSchema } = require('./controller/validation/assessmentValidation');
const { registerSchema } = require('./controller/validation/authValidation');
const { changePasswordSchema } = require('./controller/validation/userValidation');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-long-random-secret';
const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/hirehub';

async function runTests() {
  console.log('--- STARTING SECURITY HARDENING REGRESSION VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await mongoose.connect(DB_URL);
    console.log('MongoDB connected for test runner');

    // 1. Test Password Entropy Validation (TASK-AUTH-05)
    const weakPass1 = registerSchema.validate({ name: 'Alice', email: 'alice@test.com', password: 'weak' });
    assert(weakPass1.error !== undefined, 'Weak password "weak" (< 8 chars) is rejected by registerSchema');

    const weakPass2 = registerSchema.validate({ name: 'Alice', email: 'alice@test.com', password: 'alllowercase1' });
    assert(weakPass2.error !== undefined, 'Password without uppercase is rejected by registerSchema');

    const weakPass3 = registerSchema.validate({ name: 'Alice', email: 'alice@test.com', password: 'ALLUPPERCASE1' });
    assert(weakPass3.error !== undefined, 'Password without lowercase is rejected by registerSchema');

    const weakPass4 = registerSchema.validate({ name: 'Alice', email: 'alice@test.com', password: 'NoDigitsPassword' });
    assert(weakPass4.error !== undefined, 'Password without numbers is rejected by registerSchema');

    const strongPass = registerSchema.validate({ name: 'Alice', email: 'alice@test.com', password: 'StrongPassw0rd!' });
    assert(strongPass.error === undefined, 'Valid strong password is accepted by registerSchema');

    const changePassWeak = changePasswordSchema.validate({ oldPassword: 'old', newPassword: 'weak' });
    assert(changePassWeak.error !== undefined, 'Weak newPassword in changePasswordSchema is rejected');

    const changePassStrong = changePasswordSchema.validate({ oldPassword: 'old', newPassword: 'StrongNewPassw0rd!' });
    assert(changePassStrong.error === undefined, 'Strong newPassword in changePasswordSchema is accepted');

    // 2. Test Assessment Joi Schema (TASK-INT-05)
    const invalidExam1 = createAssessmentSchema.validate({ title: 'Hi', duration: 1, passingScore: 120, questions: [] });
    assert(invalidExam1.error !== undefined, 'Invalid assessment payload (short title, duration < 5, score > 100, empty questions) is rejected');

    const validExam = createAssessmentSchema.validate({
      title: 'Full Stack JavaScript Assessment',
      duration: 60,
      passingScore: 70,
      questions: [
        { type: 'mcq', text: 'What is Node.js?', maxScore: 10, options: ['Runtime', 'Language'], correctAnswer: 'Runtime' }
      ]
    });
    assert(validExam.error === undefined, 'Valid assessment schema passes validation');

    // 3. Test Redis-Backed Active User Caching & Invalidation (TASK-AUTH-01)
    const testEmail = `sec_test_${Date.now()}@example.com`;
    const hashedPass = await bcrypt.hash('StrongPass123!', 10);
    const testUser = await User.create({
      name: 'Security Test User',
      email: testEmail,
      password: hashedPass,
      role: 'candidate',
      isActive: true
    });

    const { getUserStatus } = require('./middleware/authMiddleware');

    // First call: populates cache from DB
    const start1 = Date.now();
    const status1 = await getUserStatus(testUser._id);
    const time1 = Date.now() - start1;
    assert(status1 && status1.isActive === true && status1.role === 'candidate', 'getUserStatus returns active status from DB');

    // Second call: fetched from Redis in < 5ms
    const start2 = Date.now();
    const status2 = await getUserStatus(testUser._id);
    const time2 = Date.now() - start2;
    assert(status2 && status2.isActive === true, `getUserStatus fetched from Redis cache (lat: ${time2}ms)`);

    // Invalidate cache
    await redis.del(`user:status:${testUser._id}`);
    // Suspend user
    testUser.isActive = false;
    await testUser.save();

    const status3 = await getUserStatus(testUser._id);
    assert(status3 && status3.isActive === false, 'getUserStatus reflects suspended state after DB update & cache eviction');

    // 4. Test Cascading Cleanup (TASK-AUTHZ-01)
    const companyUser = await User.create({
      name: 'Test Cascading Company',
      email: `cascading_${Date.now()}@test.com`,
      password: hashedPass,
      role: 'company',
      isActive: true
    });

    const candidateUser = await User.create({
      name: 'Test Cascading Candidate',
      email: `cand_${Date.now()}@test.com`,
      password: hashedPass,
      role: 'candidate',
      isActive: true
    });

    const companyProfile = await CompanyProfile.create({
      user: companyUser._id,
      companyName: 'Test Corp',
      industry: 'Tech'
    });

    const testJob = await Job.create({
      title: 'DevOps Engineer',
      description: 'Senior DevOps position description here',
      company: 'Test Corp',
      postedBy: companyUser._id,
      jobType: 'Full-time',
      experienceLevel: 'Senior',
      skillsRequired: ['Docker', 'Kubernetes'],
      location: 'Remote',
      salary: 120000,
      deadline: new Date(Date.now() + 86400000)
    });

    const testApp = await Application.create({
      job: testJob._id,
      applicant: candidateUser._id,
      cvUrl: '/uploads/cvs/test.pdf',
      status: 'pending'
    });

    const testNotification = await Notification.create({
      recipient: companyUser._id,
      type: 'new_application',
      title: 'New application',
      body: 'Candidate applied'
    });

    // Execute user deletion via userController
    const { deleteUser } = require('./controller/userController');
    const mockReq = { params: { id: companyUser._id.toString() }, user: { id: 'admin123', role: 'admin' } };
    let jsonResult = null;
    let statusCode = 200;
    const mockRes = {
      status: (code) => { statusCode = code; return mockRes; },
      json: (data) => { jsonResult = data; return mockRes; }
    };

    await deleteUser(mockReq, mockRes);
    assert(statusCode === 200 && jsonResult.success === true, 'Cascading deleteUser returned 200 success');

    const jobCheck = await Job.findById(testJob._id);
    const appCheck = await Application.findById(testApp._id);
    const notifCheck = await Notification.findById(testNotification._id);
    const profileCheck = await CompanyProfile.findById(companyProfile._id);
    const userCheck = await User.findById(companyUser._id);

    assert(jobCheck === null, 'Cascade deleted company jobs');
    assert(appCheck === null, 'Cascade deleted job applications');
    assert(notifCheck === null, 'Cascade deleted company notifications');
    assert(profileCheck === null, 'Cascade deleted company profile');
    assert(userCheck === null, 'Cascade deleted company user record');

    // Clean up temporary candidate
    await User.findByIdAndDelete(testUser._id);
    await User.findByIdAndDelete(candidateUser._id);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    redis.disconnect();
    console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
