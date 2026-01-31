export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If we are accessing via IP, use that IP for the API
        return `http://${hostname}:5000/api`;
    }
    // On the server, we use localhost or an environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
