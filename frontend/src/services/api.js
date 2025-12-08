import axios from 'axios';

let isLoggedOut = false;

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true
})

const handleLogout = () => {
    if (isLoggedOut) return;
    
    isLoggedOut = true;
    console.error("Refresh token expired or invalid - logging out");
    
    // Clear all storage
    localStorage.removeItem('user');
    localStorage.clear();
    
    // Clear cookies if any
    document.cookie.split(";").forEach(() => {
        document.cookie = "";
    });
    
    
    // Redirect to login
    window.location.href = "/login";
};

api.interceptors.response.use(
    (response) => response,
    async (err) =>{
        // If already logged out, reject immediately
        if (isLoggedOut) {
            return Promise.reject(err);
        }
        
        const originalRequest = err.config;
        if(err.response?.status === 401){
            // If refresh request failed or already retried, logout
            if(originalRequest.url.includes("/auth/refresh") || originalRequest._retry){
                handleLogout();
                return Promise.reject(err);
            }
            
            originalRequest._retry = true;
            try{
                const resp = await api.post('/auth/refresh');
                const newAccessToken = resp.data.data.accessToken;
                const user = localStorage.getItem("user");
                if (user) {
                    localStorage.setItem("user", JSON.stringify({...JSON.parse(user), accessToken: newAccessToken}));
                }
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            }catch(e){
                handleLogout();
                return Promise.reject(e);
            }
        }
        return Promise.reject(err);
    }
);

// Reset logout flag when user successfully logs in
export const resetLogoutFlag = () => {
    isLoggedOut = false;
};

export default api;