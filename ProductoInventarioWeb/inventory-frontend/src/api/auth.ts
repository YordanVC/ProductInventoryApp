import axios from './axios';
import type { LoginRequest, LoginResponse } from '../types/dtos';

// Función para decodificar el token JWT
const decodeToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

export const authApi = {
    login: async (credentials: LoginRequest): Promise<string> => {
        const { data } = await axios.post<LoginResponse>('/Auth/login', credentials);
        
        if (data.code === 200 && data.data.token) {
            // Guardar token en localStorage
            localStorage.setItem('token', data.data.token);
            return data.data.token;
        }
        
        throw new Error(data.message || 'Error en la autenticación');
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },

    getUserId: (): number => {
        const token = localStorage.getItem('token');
        if (!token) return 0;
        
        const decoded = decodeToken(token);
        return decoded?.ID ? parseInt(decoded.ID) : 0;
    }
};