
/**
 * Tipos y enumeraciones para la aplicación.
 */

// --- Autenticación y Usuarios ---

export enum Role {
  ADMIN = 'ROLE_ADMIN',
  SELLER = 'ROLE_SELLER',
  USER = 'ROLE_USER',
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

export interface JwtResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// --- Entidades de Negocio ---

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone?: string;
  state: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  state: boolean;
  brand: Brand;
  category: Category;
  size: Size;
}

export interface Brand {
  id: number;
  name: string;
  state: boolean;
}

export interface Category {
  id: number;
  name: string;
  state: boolean;
}

export interface Size {
  id: number;
  name: string;
  state: boolean;
}

export interface Customer {
  id: number;
  name: string;
  lastName: string;
  dni: string;
  phone?: string;
  address?: string;
}

export interface Supplier {
  id: number;
  name: string;
  ruc: string;
  phone?: string;
  address?: string;
}

// --- Transacciones ---

export interface Sale {
  id: number;
  date: string;
  total: number;
  customer: Customer;
  branch: Branch;
  user: User;
  details: SaleDetail[];
}

export interface SaleDetail {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Purchase {
  id: number;
  date: string;
  total: number;
  supplier: Supplier;
  user: User;
  details: PurchaseDetail[];
}

export interface PurchaseDetail {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

// --- Inventario ---

export interface Stock {
  id: number;
  branch: Branch;
  product: Product;
  quantity: number;
}

export interface InventoryMovement {
  id: number;
  date: string;
  quantity: number;
  type: 'IN' | 'OUT';
  product: Product;
  branch: Branch;
}

// --- Pagos ---

export interface Payment {
    id: number;
    date: string;
    amount: number;
    paymentMethod: string;
    supplier: Supplier;
}

// --- Dashboard ---

export interface DashboardStats {
  totalSales: number;
  lowStockProducts: Product[];
  recentMovements: InventoryMovement[];
}
