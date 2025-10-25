
import apiClient from './api';
import { Stock, InventoryMovement } from '../types';

/**
 * Servicio para gestionar las operaciones de inventario.
 */

const API_URL = '/inventory';

/**
 * Obtiene el stock de todos los productos por sucursal.
 * @returns Una promesa que resuelve a un array de stock.
 */
const getStockByBranch = (branchId: number): Promise<Stock[]> => {
  return apiClient.get(`${API_URL}/stock/branch/${branchId}`).then(response => response.data);
};

/**
 * Obtiene el stock total de un producto en todas las sucursales.
 * @param productId - El ID del producto.
 * @returns Una promesa que resuelve al stock total.
 */
const getTotalStockByProduct = (productId: number): Promise<Stock> => {
  return apiClient.get(`${API_URL}/stock/product/${productId}`).then(response => response.data);
};

/**
 * Obtiene todos los movimientos de inventario.
 * @returns Una promesa que resuelve a un array de movimientos.
 */
const getInventoryMovements = (): Promise<InventoryMovement[]> => {
  return apiClient.get(`${API_URL}/movements`).then(response => response.data);
};

const InventoryService = {
  getStockByBranch,
  getTotalStockByProduct,
  getInventoryMovements,
};

export default InventoryService;
