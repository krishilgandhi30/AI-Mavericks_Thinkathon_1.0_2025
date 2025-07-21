// Authentication utility functions
export const auth = {
  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Login user (store token)
  login: (token) => {
    localStorage.setItem('token', token);
  },

  // Logout user (remove token)
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  // Get user from token (decode JWT)
  getUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode JWT token (simple base64 decode of payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
};

export default auth;
