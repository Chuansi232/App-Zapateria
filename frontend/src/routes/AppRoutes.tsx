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
import Spinner from '../components/ui/Spinner';
import UnauthorizedPage from '../pages/UnauthorizedPage';

const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
    const { isAdmin } = useAuth();

    // The parent ProtectedLayout already handles the initial loading state.
    return isAdmin ? <Outlet /> : <UnauthorizedPage />;
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
      { index: true, element: <DashboardPage /> },
      { path: 'stock', element: <StockPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'purchases', element: <PurchasesPage /> },
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