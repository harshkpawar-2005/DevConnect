// src/api/axios.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    withCredentials: true, // send httpOnly cookies with every request
});

// Track if we're already refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Response interceptor: handle 401 by refreshing token
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => API(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the access token using the same API instance
                await API.post("/users/refresh-token");

                processQueue(null);
                // Retry the original request (new cookie is set automatically)
                return API(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // Let AuthContext handle logout/redirect — just reject
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;
