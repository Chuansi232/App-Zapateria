export interface Sale {
  id: number;
  customerId?: number;
  userId: number;
  branchId: number;
  saleDate: string; // ISO format
  totalAmount: number;
  documentStatusId: number;
  saleDetails: SaleDetail[];
  // Relaciones pobladas (solo para lectura)
  customer?: Customer;
  user?: User;
  branch?: Branch;
  documentStatus?: DocumentStatus;
}

export interface SaleDetail {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // Relación poblada
  product?: Product;
}

export interface Purchase {
  id: number;
  supplierId: number;
  userId: number;
  branchId: number;
  purchaseDate: string;
  totalAmount: number;
  documentStatusId: number;
  paymentStatusId: number;
  purchaseDetails: PurchaseDetail[];
  // Relaciones pobladas
  supplier?: Supplier;
  user?: User;
  branch?: Branch;
  documentStatus?: DocumentStatus;
  paymentStatus?: PaymentStatus;
}

export interface PurchaseDetail {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  brandId?: number;
  categoryId?: number;
  sizeIds?: number[];
  stock?: number;
  // Relaciones pobladas
  brand?: Brand;
  category?: Category;
  sizes?: Size[];
  state?: boolean;
}

export interface Stock {
  id: number;
  productId: number;
  branchId: number;
  quantity: number;
  // Relaciones pobladas
  product?: Product;
  branch?: Branch;
}

export interface DocumentStatus {
  id: number;
  name: string;
}

export interface PaymentStatus {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Size {
  id: number;
  name: string;
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export const Role = {
  ADMINISTRADOR: 'ROLE_ADMINISTRADOR',
  VENDEDOR: 'ROLE_VENDEDOR',
  ALMACENISTA: 'ROLE_ALMACENISTA',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  state?: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface InventoryMovement {
    id: number;
    date: string;
    quantity: number;
    type: 'IN' | 'OUT';
    product: Product;
    branch: Branch;
}

export interface DashboardStats {
    totalSales: number;
    lowStockProducts: Product[];
    recentMovements: InventoryMovement[];
}
