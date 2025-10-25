
import apiClient from './api';
import type { Branch } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de sucursales.
 */

const API_URL = '/branches';

const getBranches = (): Promise<Branch[]> => {
  return apiClient.get(API_URL).then(response => response.data);
};

const getBranchById = (id: number): Promise<Branch> => {
  return apiClient.get(`${API_URL}/${id}`).then(response => response.data);
};

const createBranch = (branchData: Partial<Branch>): Promise<Branch> => {
  return apiClient.post(API_URL, branchData).then(response => response.data);
};

const updateBranch = (id: number, branchData: Partial<Branch>): Promise<Branch> => {
  return apiClient.put(`${API_URL}/${id}`, branchData).then(response => response.data);
};

const deleteBranch = (id: number): Promise<void> => {
  return apiClient.delete(`${API_URL}/${id}`);
};

const BranchService = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};

export default BranchService;
