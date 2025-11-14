import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/', 
});

export const login = async (credentials) => {
const response = await API.post('auth/login/', credentials);
return response.data;
};

export const getreports = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');
    const response = await API.get('student/reports/', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getcurrentuser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');
    const response = await API.get('auth/get-user/', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};