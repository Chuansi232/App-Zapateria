
import apiClient from './api';
import { Purchase } from '../types';

/**
 * Servicio para gestionar las operaciones de compras a proveedores.
 */

const API_URL = '/purchases';

/**
 * Obtiene todas las compras.
 * @returns Una promesa que resuelve a un array de compras.
 */
const getPurchases = (): Promise<Purchase[]> => {
  return apiClient.get(API_URL).then(response => response.data);
};

/**
 * Crea una nueva compra.
 * @param purchaseData - Datos de la nueva compra.
 * @returns Una promesa que resuelve a la compra creada.
 */
const createPurchase = (purchaseData: Partial<Purchase>): Promise<Purchase> => {
  return apiClient.post(API_URL, purchaseData).then(response => response.data);
};

const PurchaseService = {
  getPurchases,
  createPurchase,
};

export default PurchaseService;
