
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ArchiveBoxIcon, 
  BuildingStorefrontIcon, 
  ShoppingCartIcon, 
  TruckIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

/**
 * Barra lateral de navegación.
 * Muestra enlaces a las diferentes secciones de la aplicación según el rol del usuario.
 */

const commonRoutes = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Stock', to: '/stock', icon: ChartBarIcon },
  { name: 'Ventas', to: '/sales', icon: ShoppingCartIcon },
  { name: 'Compras', to: '/purchases', icon: TruckIcon },
];

const adminRoutes = [
  { name: 'Usuarios', to: '/users', icon: UsersIcon },
  { name: 'Productos', to: '/products', icon: ArchiveBoxIcon },
  { name: 'Sucursales', to: '/branches', icon: BuildingStorefrontIcon },
];

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-200 hover:bg-blue-800 hover:text-white'
      }`
    }
  >
    <Icon className="h-5 w-5 mr-3" />
    {children}
  </NavLink>
);

const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="bg-blue-900 text-white w-64 p-4 space-y-2 flex flex-col">
      <div className="text-2xl font-bold text-center py-4">Zapatería BWC</div>
      <nav className="flex-grow">
        {commonRoutes.map(route => (
          <NavItem key={route.name} to={route.to} icon={route.icon}>
            {route.name}
          </NavItem>
        ))}
        
        {isAdmin && adminRoutes.map(route => (
          <NavItem key={route.name} to={route.to} icon={route.icon}>
            {route.name}
          </NavItem>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
