import { api } from './api';

export const ecoService = {
  // Dashboard stats
  async getDashboardStats() {
    const res = await api.get('/dashboard/stats');
    return res?.data;
  },

  // Declarations / History
  async getUserDeclarations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/waste-declarations?${query}` : '/waste-declarations';
    const res = await api.get(endpoint);
    return res?.data;
  },

  // Profile
  async getProfile() {
    const res = await api.get('/users/profile');
    return res?.data;
  },

  async updateProfile(profileData) {
    const res = await api.patch('/users/profile', profileData);
    return res?.data;
  },

  // Rewards
  async getRewards() {
    const res = await api.get('/rewards');
    return res?.data?.rewards || [];
  },

  async redeemReward(rewardId, notes = '') {
    const res = await api.post('/rewards/redeem', { rewardId, notes });
    return res?.data;
  },

  async getUserRedemptions() {
    const res = await api.get('/rewards/redemptions');
    return res?.data?.redemptions || [];
  },

  // Notifications
  async getNotifications() {
    const res = await api.get('/notifications');
    return res?.data;
  },

  async markNotificationAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res?.data;
  },

  async markAllNotificationsAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res?.data;
  },

  // Badges & Leaderboard
  async getLeaderboard(limit = 20) {
    const res = await api.get(`/leaderboard?limit=${limit}`);
    return res?.data?.leaderboard || [];
  },

  async getUserBadges() {
    const res = await api.get('/badges/my-badges');
    return res?.data;
  },
};
