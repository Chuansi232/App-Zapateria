import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import LowStockTable from '../components/dashboard/LowStockTable';
import DashboardService from '../services/DashboardService';
import type { DashboardStats } from '../types';
import { 
  CurrencyDollarIcon, 
  ArchiveBoxXMarkIcon, 
  ArrowPathIcon,
  ShoppingCartIcon,
  TruckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

/**
 * Página principal del dashboard.
 * Muestra estadísticas clave y gráficos sobre el estado del negocio.
 */
const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 text-lg font-semibold mb-2">{error}</p>
        <p className="text-gray-500 text-sm mb-6">Por favor, intenta nuevamente</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
  if (!stats) return <p>No hay datos disponibles.</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      
      {/* Estadísticas Principales con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Ventas Totales</p>
              <p className="text-3xl font-bold text-blue-900">
                Q{stats.totalSales.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-xl shadow-md">
              <CurrencyDollarIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Productos con Bajo Stock</p>
              <p className="text-3xl font-bold text-amber-900">{stats.lowStockProducts.length}</p>
            </div>
            <div className="bg-amber-500 p-4 rounded-xl shadow-md">
              <ArchiveBoxXMarkIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Movimientos Recientes</p>
              <p className="text-3xl font-bold text-purple-900">{stats.recentMovements.length}</p>
            </div>
            <div className="bg-purple-500 p-4 rounded-xl shadow-md">
              <ArrowPathIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Avisos mejorados */}
      {stats.lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-5 rounded-r-2xl shadow-lg">
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <ArchiveBoxXMarkIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-base font-bold text-yellow-900">
                ⚠️ Atención: Productos con stock bajo
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                Hay <span className="font-semibold">{stats.lowStockProducts.length}</span> producto{stats.lowStockProducts.length !== 1 ? 's' : ''} que necesita{stats.lowStockProducts.length !== 1 ? 'n' : ''} reabastecimiento urgente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos y Tablas con diseño mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          {/* 🆕 Pasar los datos reales al componente */}
          <SalesChart data={stats.weeklySales || []} />
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">Movimientos Recientes</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Últimos 5
            </span>
          </div>
          {stats.recentMovements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowPathIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 font-medium">No hay movimientos recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentMovements.slice(0, 5).map((movement) => (
                <div 
                  key={movement.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-lg ${
                      movement.type === 'IN' 
                        ? 'bg-green-100 group-hover:bg-green-200' 
                        : 'bg-blue-100 group-hover:bg-blue-200'
                    } transition-colors`}>
                      {movement.type === 'IN' ? (
                        <TruckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {movement.product?.name || 'Producto'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📍 {movement.branch?.name || 'Sucursal'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      movement.type === 'IN' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {movement.date ? new Date(movement.date).toLocaleDateString('es-GT', {
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Productos con Bajo Stock */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <LowStockTable products={stats.lowStockProducts} />
      </div>

      {/* Accesos Rápidos mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a 
          href="/sales" 
          className="group block p-8 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between text-white relative z-10">
            <div>
              <p className="text-sm font-semibold opacity-90 mb-1">Nueva</p>
              <p className="text-3xl font-bold mb-2">Venta</p>
              <p className="text-xs opacity-75">Registrar operación</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-4 rounded-xl group-hover:bg-blue-300 group-hover:bg-opacity-40 transition-all duration-300 group-hover:scale-110 transform backdrop-blur-sm">
              <ShoppingCartIcon className="h-12 w-12 drop-shadow-lg stroke-2" />
            </div>
          </div>
        </a>

        <a 
          href="/purchases" 
          className="group block p-8 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between text-white relative z-10">
            <div>
              <p className="text-sm font-semibold opacity-90 mb-1">Nueva</p>
              <p className="text-3xl font-bold mb-2">Compra</p>
              <p className="text-xs opacity-75">Agregar productos</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-4 rounded-xl group-hover:bg-green-300 group-hover:bg-opacity-40 transition-all duration-300 group-hover:scale-110 transform backdrop-blur-sm">
              <TruckIcon className="h-12 w-12 drop-shadow-lg stroke-2" />
            </div>
          </div>
        </a>

        <a 
          href="/stock" 
          className="group block p-8 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between text-white relative z-10">
            <div>
              <p className="text-sm font-semibold opacity-90 mb-1">Ver</p>
              <p className="text-3xl font-bold mb-2">Inventario</p>
              <p className="text-xs opacity-75">Control de stock</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-4 rounded-xl group-hover:bg-purple-300 group-hover:bg-opacity-40 transition-all duration-300 group-hover:scale-110 transform backdrop-blur-sm">
              <ChartBarIcon className="h-12 w-12 drop-shadow-lg stroke-2" />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default DashboardPage;