import apiClient from './api';
import type { DashboardStats, InventoryMovement } from '../types';

const API_URL = '/dashboard';


const getStats = (): Promise<DashboardStats> => {
  return apiClient.get(`${API_URL}/stats`).then(response => {
    const data = response.data;
    
    if (data.recentMovements) {
      data.recentMovements = data.recentMovements.map((movement: any) => ({
        ...movement,
        date: movement.movementDate, // Alias para compatibilidad
        type: movement.movementTypeName?.toUpperCase().includes('ENTRADA') ? 'IN' : 'OUT'
      }));
    }
    
    return data;
  });
};

const DashboardService = {
  getStats,
};

export default DashboardService;