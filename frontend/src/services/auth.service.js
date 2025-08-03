import { post, get, put } from './api';

export const authService = {
  async login(credentials) {
    const response = await post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await post('/auth/register', userData);
    return response.data;
  },

  async firebaseLogin(idToken) {
    const response = await post('/auth/firebase-login', { idToken });
    return response.data;
  },

  async logout(refreshToken) {
    await post('/auth/logout', { refreshToken });
  },

  async getProfile() {
    const response = await get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await put('/auth/profile', profileData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await put('/auth/change-password', passwordData);
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await post('/auth/reset-password', { token, password });
    return response.data;
  }
};