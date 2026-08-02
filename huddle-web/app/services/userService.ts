import api from './api';

export const userService = {
  getProfiles: async () => {
    const response = await api.get('/users/profiles');
    return response.data;
  },
  followUser: async (userId) => {
    const response = await api.post(`/users/follow/${userId}`);
    return response.data;
  },
  unfollowUser: async (userId) => {
    const response = await api.post(`/users/unfollow/${userId}`);
    return response.data;
  }
};
