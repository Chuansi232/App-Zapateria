import apiClient from './api';
import type { Stock, InventoryMovement } from '../types';

/**
 * Servicio para gestionar las operaciones de inventario.
 */

const API_URL = '/inventory';

/**
 * Obtiene el stock de todos los productos por sucursal.
 * @param branchId - ID de la sucursal
 * @returns Una promesa que resuelve a un array de stock.
 */
const getStockByBranch = (branchId: number): Promise<Stock[]> => {
  return apiClient.get(`${API_URL}/stock/branch/${branchId}`).then(response => {
    // Enriquecer los datos con información del producto
    return response.data.map((stock: any) => ({
      ...stock,
      product: stock.product || {}
    }));
  });
};

/**
 * Obtiene el stock total de un producto en todas las sucursales.
 * @param productId - El ID del producto.
 * @returns Una promesa que resuelve al stock total.
 */
const getTotalStockByProduct = (productId: number): Promise<Stock[]> => {
  return apiClient.get(`${API_URL}/stock/product/${productId}`).then(response => response.data);
};

/**
 * Obtiene todos los movimientos de inventario.
 * @returns Una promesa que resuelve a un array de movimientos.
 */
const getInventoryMovements = (): Promise<InventoryMovement[]> => {
  return apiClient.get(`${API_URL}/movements`).then(response => response.data);
};

/**
 * Obtiene el stock de un producto específico en una sucursal específica.
 * @param productId - ID del producto
 * @param branchId - ID de la sucursal
 * @returns Una promesa que resuelve al stock del producto
 */
const getStockByProductAndBranch = (productId: number, branchId: number): Promise<Stock> => {
  return apiClient.get(`${API_URL}/stock`, {
    params: { productId, branchId }
  }).then(response => response.data);
};

const InventoryService = {
  getStockByBranch,
  getTotalStockByProduct,
  getInventoryMovements,
  getStockByProductAndBranch,
};

export default InventoryService;