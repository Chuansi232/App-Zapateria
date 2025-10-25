
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Layout principal de la aplicación.
 * Combina la barra lateral, la cabecera y el contenido principal de las páginas.
 */
const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {/* El Outlet renderiza la página actual que coincide con la ruta anidada */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
