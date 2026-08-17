import API from './api';

export const getMedicinesApi = async (filters = {}) => {
  const response = await API.get('/medicine', { params: filters });
  return response.data;
};

export const getMedicineByIdApi = async (id) => {
  const response = await API.get(`/medicine/${id}`);
  return response.data;
};

export const createMedicineApi = async (formData) => {
  const response = await API.post('/medicine', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateMedicineApi = async (id, formData) => {
  const response = await API.put(`/medicine/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteMedicineApi = async (id) => {
  const response = await API.delete(`/medicine/${id}`);
  return response.data;
};
