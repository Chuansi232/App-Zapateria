import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import ProductsPage from '../pages/ProductsPage';
import BranchesPage from '../pages/BranchesPage';
import SalesPage from '../pages/SalesPage';
import PurchasesPage from '../pages/PurchasesPage';
import StockPage from '../pages/StockPage';
import { Role } from '../types';

/**
 * Componente de Layout Protegido
 * Si el usuario está autenticado, renderiza el MainLayout con las páginas anidadas.
 * Si no, redirige a la página de login.
 */
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

/**
 * Componente para proteger rutas que requieren rol de Administrador.
 */
const AdminRoute = () => {
    const { isAdmin } = useAuth();
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      // Rutas para todos los usuarios autenticados
      { index: true, element: <DashboardPage /> },
      { path: 'stock', element: <StockPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'purchases', element: <PurchasesPage /> },
      
      // Rutas exclusivas para Administradores
      {
        element: <AdminRoute />,
        children: [
            { path: 'users', element: <UsersPage /> },
            { path: 'products', element: <ProductsPage /> },
            { path: 'branches', element: <BranchesPage /> },
        ]
      }
    ],
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;