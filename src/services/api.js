import axios from 'axios';
import router from '@/router'; // Assurez-vous que votre routeur Vue est bien importé

export const BASE_API_URL = process.env.VUE_APP_BASE_API_URL || 'http://localhost:8000/api/v1'
export const APP_FILE_URL = process.env.VUE_APP_FILE_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: BASE_API_URL
});

// Ajoutez un intercepteur de requête pour inclure le jeton d'accès dans chaque requête
api.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Ajoutez un intercepteur de réponse pour gérer les erreurs 401
api.interceptors.response.use(
    response => response, // Retourner la réponse normale si tout va bien
    error => {
        if (error.response && error.response.status === 401) {
            // Efface le localStorage
            localStorage.removeItem('access_token');
            // Redirige vers la page de connexion
            router.push('/login').catch(() => {}); // Évite les erreurs de navigation en double
        }
        return Promise.reject(error);
    }
);

export default api;
