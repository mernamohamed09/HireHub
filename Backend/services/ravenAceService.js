const RAVENACE_BASE_URL = process.env.RAVENACE_BASE_URL || 'https://ravenace.onrender.com';
const DEFAULT_TIMEOUT_MS = Number(process.env.RAVENACE_TIMEOUT_MS) || 10000;

/**
 * Fetch wrapper with strict AbortSignal timeout
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`RavenACE API request timed out after ${DEFAULT_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Helper to generate standard headers for RavenACE integration
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-API-Key-Id': process.env.RAVENACE_API_KEY_ID,
    'X-API-Key-Secret': process.env.RAVENACE_API_KEY_SECRET,
  };
};

/**
 * Calls POST /api/integrations/hirehub/exams to create a new assessment
 * @param {Object} examData - The exam payload containing title, duration, passingScore, questions, companyName
 * @param {String} externalCompanyId - The unique tenant ID (e.g. recruiter's user ObjectId)
 * @returns {Promise<String>} The created ravenAceExamId
 */
const createExam = async (examData, externalCompanyId) => {
  const url = `${RAVENACE_BASE_URL}/api/integrations/hirehub/exams`;
  
  const payload = {
    ...examData,
    externalCompanyId: externalCompanyId.toString()
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Failed to create exam in RavenACE';
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    throw error;
  }

  return data.data.examId;
};

/**
 * Calls POST /api/integrations/hirehub/invitations to invite a candidate
 * @param {String} examId - The ravenAceExamId
 * @param {String} email - The candidate's email
 * @param {String} externalCompanyId - The unique tenant ID
 * @returns {Promise<String>} The created ravenAceInvitationId
 */
const inviteCandidate = async (examId, email, externalCompanyId) => {
  const url = `${RAVENACE_BASE_URL}/api/integrations/hirehub/invitations`;
  
  const payload = {
    examId,
    email,
    externalCompanyId: externalCompanyId.toString()
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Failed to invite candidate in RavenACE';
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    throw error;
  }

  return data.data;
};

/**
 * Calls GET /api/integrations/hirehub/invitations/{invitationId}/result to get the current status and score
 * @param {String} invitationId - The ravenAceInvitationId
 * @returns {Promise<Object>} An object containing status, score, passed
 */
const getExamResult = async (invitationId) => {
  const url = `${RAVENACE_BASE_URL}/api/integrations/hirehub/invitations/${invitationId}/result`;
  
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Failed to get result from RavenACE';
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    throw error;
  }
  return data.data; // { status: "completed", score: 85, passed: true }
};

/**
 * Calls GET /api/integrations/hirehub/invitations/{invitationId}/detailed-result to get detailed question-by-question result
 * @param {String} invitationId - The ravenAceInvitationId
 * @returns {Promise<Object>} An object containing detailed result data
 */
const getDetailedResult = async (invitationId) => {
  const url = `${RAVENACE_BASE_URL}/api/integrations/hirehub/invitations/${invitationId}/detailed-result`;
  
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Failed to get detailed result from RavenACE';
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    throw error;
  }

  return data.data;
};

/**
 * Calls POST /api/integrations/hirehub/invitations/{invitationId}/generate-link
 * @param {String} invitationId - The ravenAceInvitationId
 * @returns {Promise<Object>} An object containing { inviteUrl } or { alreadyStarted: true }
 */
const generateInviteLink = async (invitationId) => {
  const url = `${RAVENACE_BASE_URL}/api/integrations/hirehub/invitations/${invitationId}/generate-link`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Failed to generate invite link from RavenACE';
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

module.exports = {
  createExam,
  inviteCandidate,
  getExamResult,
  getDetailedResult,
  generateInviteLink
};
