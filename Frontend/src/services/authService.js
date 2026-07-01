
// Mock delays for a realistic feel since backend isn't ready
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (credentials) => {
    await delay(1000);
    // Mock successful login
    if (credentials.email === 'error@test.com') {
      throw new Error('Invalid credentials');
    }
    const mockUser = {
      id: '1',
      name: 'Sarah Ahmed',
      email: credentials.email,
      role: credentials.email.includes('admin') ? 'Admin' : (credentials.email.includes('company') ? 'Company' : 'Candidate'),
      avatar: 'https://via.placeholder.com/40'
    };
    const mockToken = 'mock-jwt-token-12345';
    localStorage.setItem('token', mockToken);
    
    return { user: mockUser, token: mockToken };
  },

  register: async (userData) => {
    await delay(1200);
    // Mock successful registration
    const mockUser = {
      id: '2',
      name: userData.fullName,
      email: userData.email,
      role: userData.role || 'Candidate',
      avatar: 'https://via.placeholder.com/40'
    };
    const mockToken = 'mock-jwt-token-register';
    localStorage.setItem('token', mockToken);
    
    return { user: mockUser, token: mockToken };
  },

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  getCurrentUser: async () => {
    await delay(500);
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    // Mock user profile fetch
    return {
      id: '1',
      name: 'Sarah Ahmed',
      email: 'sarah@example.com',
      role: 'Candidate',
      avatar: 'https://via.placeholder.com/40'
    };
  }
};
