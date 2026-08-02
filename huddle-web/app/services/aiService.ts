import api from './api';

export const aiService = {
  createEventFromPrompt: async (prompt) => {
    const response = await api.post('/ai/create-event', { prompt });
    return response.data;
  }
};
