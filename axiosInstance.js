import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://dwarkesh-be.onrender.com',
    timeout: 10000, // optional: 10 seconds timeout
});

export default axiosInstance;
