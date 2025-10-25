
import apiClient from './api';
import { JwtResponse } from '../types';
import { LoginRequest, SignUpRequest } from '../types/request';

/**
 * Servicio para gestionar la autenticación (login, registro).
 */

const API_URL = '/auth';

/**
 * Envía una petición de login al backend.
 * @param credentials - Objeto con `username` y `password`.
 * @returns Una promesa que resuelve a una respuesta JWT.
 */
const login = (credentials: LoginRequest): Promise<JwtResponse> => {
  return apiClient.post(`${API_URL}/signin`, credentials).then(response => response.data);
};

/**
 * Envía una petición de registro de un nuevo usuario.
 * @param userData - Datos del nuevo usuario.
 * @returns Una promesa que resuelve a un mensaje de éxito.
 */
const signup = (userData: SignUpRequest): Promise<any> => {
  return apiClient.post(`${API_URL}/signup`, userData).then(response => response.data);
};

const AuthService = {
  login,
  signup,
};

export default AuthService;
