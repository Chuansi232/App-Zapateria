
import apiClient from './api';
import type { Product, Brand, Category, Size } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de productos y entidades relacionadas.
 */

// --- Productos ---
const getProducts = (): Promise<Product[]> => apiClient.get('/products').then(res => res.data);
const getProductById = (id: number): Promise<Product> => apiClient.get(`/products/${id}`).then(res => res.data);
const createProduct = (product: Partial<Product>): Promise<Product> => apiClient.post('/products', product).then(res => res.data);
const updateProduct = (id: number, product: Partial<Product>): Promise<Product> => apiClient.put(`/products/${id}`, product).then(res => res.data);
const deleteProduct = (id: number): Promise<void> => apiClient.delete(`/products/${id}`);

// --- Marcas (Brands) ---
const getBrands = (): Promise<Brand[]> => apiClient.get('/brands').then(res => res.data);
const createBrand = (brand: Partial<Brand>): Promise<Brand> => apiClient.post('/brands', brand).then(res => res.data);

// --- Categorías (Categories) ---
const getCategories = (): Promise<Category[]> => apiClient.get('/categories').then(res => res.data);
const createCategory = (category: Partial<Category>): Promise<Category> => apiClient.post('/categories', category).then(res => res.data);

// --- Tallas (Sizes) ---
const getSizes = (): Promise<Size[]> => apiClient.get('/sizes').then(res => res.data);
const createSize = (size: Partial<Size>): Promise<Size> => apiClient.post('/sizes', size).then(res => res.data);


const ProductService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  createBrand,
  getCategories,
  createCategory,
  getSizes,
  createSize,
};

export default ProductService;
