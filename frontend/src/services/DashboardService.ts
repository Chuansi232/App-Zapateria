
import type { DashboardStats } from '../types';

const getStats = (): Promise<DashboardStats> => {
  // En un backend real, este endpoint devolvería todos los datos necesarios.
  // Aquí simulamos una posible estructura de respuesta.
  // return apiClient.get(API_URL).then(response => response.data);

  // --- Datos de ejemplo mientras se conecta el backend ---
  return Promise.resolve({
    totalSales: 12540.50,
    lowStockProducts: [
      { id: 1, name: 'Zapato Casual Flexi', stock: 4, brand: {id: 1, name: 'Flexi', state: true}, category: {id: 1, name: 'Casual', state: true}, size: {id: 1, name: '27', state: true}, description: '', purchasePrice: 0, salePrice: 0, state: true },
      { id: 2, name: 'Bota Industrial', stock: 2, brand: {id: 2, name: 'CAT', state: true}, category: {id: 2, name: 'Industrial', state: true}, size: {id: 2, name: '28', state: true}, description: '', purchasePrice: 0, salePrice: 0, state: true },
    ],
    recentMovements: [
        { id: 1, date: '2023-10-27T10:00:00Z', quantity: 1, type: 'OUT', product: { id: 3, name: 'Tenis Nike Air', stock: 0, brand: {id: 3, name: 'Nike', state: true}, category: {id: 3, name: 'Deportivo', state: true}, size: {id: 3, name: '26', state: true}, description: '', purchasePrice: 0, salePrice: 0, state: true }, branch: {id: 1, name: 'Sucursal Centro', address: '', phone: '', state: true} },
        { id: 2, date: '2023-10-27T09:00:00Z', quantity: 10, type: 'IN', product: { id: 1, name: 'Zapato Casual Flexi', stock: 0, brand: {id: 1, name: 'Flexi', state: true}, category: {id: 1, name: 'Casual', state: true}, size: {id: 1, name: '27', state: true}, description: '', purchasePrice: 0, salePrice: 0, state: true }, branch: {id: 1, name: 'Sucursal Centro', address: '', phone: '', state: true} },
    ]
  });
  // --- Fin de datos de ejemplo ---
};

const DashboardService = {
  getStats,
};

export default DashboardService;
