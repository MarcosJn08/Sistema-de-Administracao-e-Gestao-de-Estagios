import axios from 'axios';

class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  allowAbsoluteUrls: false,
  adapter: 'fetch',
  withCredentials: false,
  withXSRFToken: false,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export function configureApiAuth({ getToken, onUnauthorized }) {
  const requestInterceptor = api.interceptors.request.use((config) => {
    const token = getToken();
    if (token && !config.skipAuth) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.delete('Authorization');
    }
    return config;
  });

  const responseInterceptor = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error)) return Promise.reject(error);

      const status = error.response?.status || 0;
      const payload = error.response?.data;
      const currentToken = getToken();
      const requestAuthorization = error.config?.headers?.get('Authorization');
      if (status === 401 && error.config?.notifyUnauthorized !== false
          && (!currentToken || requestAuthorization === `Bearer ${currentToken}`)) {
        onUnauthorized();
      }

      const message = status === 0
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
        : status === 429
          ? 'Muitas tentativas. Aguarde um minuto antes de tentar novamente.'
          : payload?.message || 'Não foi possível concluir a solicitação.';
      return Promise.reject(new ApiError(message, status, payload?.errors || {}));
    },
  );

  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
}

export default api;
