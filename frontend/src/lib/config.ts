export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getApiUrl = (endpoint: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // ensure base url doesn't have trailing slash? (standardize on base no-slash, endpoint has slash)
    return `${API_BASE_URL}/${cleanEndpoint}`;
};
