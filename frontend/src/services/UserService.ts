
import apiClient from './api';
import type { User } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de usuarios.
 * Nota: Estas operaciones generalmente requieren rol de Administrador.
 */

const API_URL = '/users';

/**
 * Obtiene todos los usuarios.
 * @returns Una promesa que resuelve a un array de usuarios.
 */
const getUsers = (): Promise<User[]> => {
  return apiClient.get(API_URL).then(response => response.data);
};

/**
 * Obtiene un usuario por su ID.
 * @param id - El ID del usuario.
 * @returns Una promesa que resuelve a los datos del usuario.
 */
const getUserById = (id: number): Promise<User> => {
  return apiClient.get(`${API_URL}/${id}`).then(response => response.data);
};

/**
 * Crea un nuevo usuario.
 * @param userData - Datos del nuevo usuario.
 * @returns Una promesa que resuelve al usuario creado.
 */
const createUser = (userData: Partial<User>): Promise<User> => {
  return apiClient.post(API_URL, userData).then(response => response.data);
};

/**
 * Actualiza un usuario existente.
 * @param id - El ID del usuario a actualizar.
 * @param userData - Los datos actualizados del usuario.
 * @returns Una promesa que resuelve al usuario actualizado.
 */
const updateUser = (id: number, userData: Partial<User>): Promise<User> => {
  return apiClient.put(`${API_URL}/${id}`, userData).then(response => response.data);
};

/**
 * Elimina un usuario por su ID.
 * @param id - El ID del usuario a eliminar.
 * @returns Una promesa.
 */
const deleteUser = (id: number): Promise<void> => {
  return apiClient.delete(`${API_URL}/${id}`);
};

const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default UserService;
