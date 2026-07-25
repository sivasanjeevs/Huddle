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

  deleteLobby: async (lobbyId) => {
    const response = await api.delete(`/lobbies/${lobbyId}`);
    return response.data;
  }
};
