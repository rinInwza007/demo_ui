import axios from 'axios';


export const FindOneRecipt = async (id) => {
  const response = await axios.get(`http://localhost:3001/recipts/${id}`);
  return response.data;
};

export const GetRecipt = async () => {
  const response = await axios.get("http://localhost:3000/receipts");
  return response.data;
};

let nextId = Number(localStorage.getItem("nextId")) || 1;

export const SaveRecipt = async (payload) => {
  payload.id = nextId;
  nextId++;
  localStorage.setItem("nextId", nextId.toString());
  const response = await axios.post("http://localhost:3000/receipts", payload);
  return response.data;
};

export const updateRecipt = async (id, payload) => {
  const response = await axios.put(`http://localhost:3001/recipts/${id}`, payload);
  return response.data;
};

export const DeleteRecipt = async (id) => {
  const response = await axios.delete(`http://localhost:3001/recipts/${id}`);
  return response.data;
};