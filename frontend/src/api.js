import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/auth/', 
});

export const login = async (credentials) => {
const response = await API.post('login/', credentials);
return response.data;
};