import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { create } from 'zustand';

// 1. GESTÃO DE ESTADO DA INTERFACE (UI State) - Zustand
interface UIState {
    currentOrganizationId: string | null;
    currentRole: string | null;
    searchQuery: string;
    setOrganization: (id: string, role?: string | null) => void;
    clearOrganization: () => void;
    setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentOrganizationId: null,
    currentRole: null,
    searchQuery: '',
    setOrganization: (id, role = null) => set({ currentOrganizationId: id, currentRole: role }),
    clearOrganization: () => set({ currentOrganizationId: null, currentRole: null }),
    setSearchQuery: (query) => set({ searchQuery: query }),
}));

// 2. CAMADA DE REDE (Axios com Interceptors)
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Funções utilitárias seguras para Tokens (Capacitor Preferences)
const TOKEN_KEY = 'chama_access_token';
const REFRESH_KEY = 'chama_refresh_token';

export const authStorage = {
    setTokens: async (access: string, refresh: string) => {
        await Preferences.set({ key: TOKEN_KEY, value: access });
        await Preferences.set({ key: REFRESH_KEY, value: refresh });
    },
    getAccessToken: async () => (await Preferences.get({ key: TOKEN_KEY })).value,
    getRefreshToken: async () => (await Preferences.get({ key: REFRESH_KEY })).value,
    clear: async () => {
        await Preferences.remove({ key: TOKEN_KEY });
        await Preferences.remove({ key: REFRESH_KEY });
    }
};

// Interceptor de Request: Injeta o JWT em todas as chamadas.
api.interceptors.request.use(async (config) => {
    const token = await authStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Interceptor de Response: Trata 401 Unauthorized e faz o Refresh silencioso.
let isRefreshing = false;
let failedQueue: Array<{resolve: (value: unknown) => void, reject: (reason?: unknown) => void}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await authStorage.getRefreshToken();
        
        if (!refreshToken) {
            await authStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
                refresh: refreshToken
            });
            
            await authStorage.setTokens(data.access, refreshToken);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
            originalRequest.headers['Authorization'] = 'Bearer ' + data.access;
            
            processQueue(null, data.access);
            return api(originalRequest);
        } catch (err) {
            processQueue(err, null);
            await authStorage.clear();
            window.location.href = '/login';
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }

    return Promise.reject(error);
});
