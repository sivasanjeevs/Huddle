import api from './api';

export const lobbyService = {
  createLobby: async (lobbyData) => {
    const response = await api.post('/lobbies', lobbyData);
    return response.data;
  },

  getLobbies: async () => {
    const response = await api.get('/lobbies');
    return response.data;
  },

  getMyLobbies: async () => {
    const response = await api.get('/lobbies/my-lobbies');
    return response.data;
  },

  getLobbyById: async (lobbyId) => {
    const response = await api.get(`/lobbies/${lobbyId}`);
    return response.data;
  },

  getLobbyMessages: async (lobbyId) => {
    const response = await api.get(`/lobbies/${lobbyId}/messages`);
    return response.data;
  },

  joinLobby: async (lobbyId) => {
    const response = await api.post(`/lobbies/${lobbyId}/join`);
    return response.data;
  },

  leaveLobby: async (lobbyId) => {
    const response = await api.post(`/lobbies/${lobbyId}/leave`);
    return response.data;
  },

  deleteLobby: async (lobbyId) => {
    const response = await api.delete(`/lobbies/${lobbyId}`);
    return response.data;
  },

  updateLobby: async (lobbyId, lobbyData) => {
    const response = await api.put(`/lobbies/${lobbyId}`, lobbyData);
    return response.data;
  },

  hardDeleteLobby: async (lobbyId) => {
    const response = await api.delete(`/lobbies/${lobbyId}/hard`);
    return response.data;
  },

  toggleLike: async (lobbyId) => {
    const response = await api.post(`/lobbies/${lobbyId}/like`);
    return response.data;
  },

  getComments: async (lobbyId) => {
    const response = await api.get(`/lobbies/${lobbyId}/comments`);
    return response.data;
  },

  postComment: async (lobbyId, data) => {
    const response = await api.post(`/lobbies/${lobbyId}/comments`, data);
    return response.data;
  },

  getPhotos: async (lobbyId) => {
    const response = await api.get(`/lobbies/${lobbyId}/photos`);
    return response.data;
  },

  uploadPhoto: async (lobbyId, formData) => {
    const response = await api.post(`/lobbies/${lobbyId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deletePhoto: async (lobbyId, photoId) => {
    const response = await api.delete(`/lobbies/${lobbyId}/photos/${photoId}`);
    return response.data;
  }
};
