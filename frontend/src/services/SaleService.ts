
import apiClient from './api';
import { Sale } from '../types';

/**
 * Servicio para gestionar las operaciones de ventas.
 */

const API_URL = '/sales';

/**
 * Obtiene todas las ventas.
 * @returns Una promesa que resuelve a un array de ventas.
 */
const getSales = (): Promise<Sale[]> => {
  return apiClient.get(API_URL).then(response => response.data);
};

/**
 * Crea una nueva venta.
 * @param saleData - Datos de la nueva venta.
 * @returns Una promesa que resuelve a la venta creada.
 */
const createSale = (saleData: Partial<Sale>): Promise<Sale> => {
  return apiClient.post(API_URL, saleData).then(response => response.data);
};

const SaleService = {
  getSales,
  createSale,
};

export default SaleService;
