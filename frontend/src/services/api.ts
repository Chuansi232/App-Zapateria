
import axios from 'axios';

/**
 * Configuración central de Axios para las llamadas a la API.
 */

// Crea una instancia de Axios con la URL base del backend.
// Esta URL debe coincidir con el puerto donde corre tu backend de Spring Boot.
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de peticiones.
 * Se ejecuta antes de que cada petición sea enviada.
 * Su propósito es obtener el token JWT desde el localStorage y añadirlo
 * a la cabecera de autorización en cada llamada a la API.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Intenta obtener los datos del usuario del localStorage.
    const userStored = localStorage.getItem('user');
    if (userStored) {
      // Parsea los datos y extrae el token.
      const userData = JSON.parse(userStored);
      const token = userData?.token;

      // Si existe un token, lo añade a la cabecera 'Authorization'.
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Maneja errores que ocurran durante la configuración de la petición.
    return Promise.reject(error);
  }
);

export default apiClient;
