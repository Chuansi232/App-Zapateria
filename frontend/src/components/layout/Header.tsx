
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

/**
 * Cabecera principal de la aplicación.
 * Muestra el nombre de usuario y un botón para cerrar sesión.
 */
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-end items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <UserCircleIcon className="h-6 w-6 text-gray-500" />
          <span className="text-gray-700 font-medium">{user?.username || 'Usuario'}</span>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
          title="Cerrar Sesión"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
