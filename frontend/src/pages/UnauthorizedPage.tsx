import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-6">
      <ShieldExclamationIcon className="w-24 h-24 text-red-400 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
      <p className="text-lg text-gray-600 mb-6">No tienes los permisos necesarios para acceder a esta página.</p>
      <Link 
        to="/"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
