
import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import LowStockTable from '../components/dashboard/LowStockTable';
import DashboardService from '../services/DashboardService';
import type { DashboardStats } from '../types';
import { CurrencyDollarIcon, ArchiveBoxXMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p>No hay datos disponibles.</p>;

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Ventas Totales (Mes)" 
          value={`$${stats.totalSales.toLocaleString('es-MX')}`}
          icon={<CurrencyDollarIcon className="w-8 h-8" />}
        />
        <StatCard 
          title="Productos con Bajo Stock" 
          value={stats.lowStockProducts.length}
          icon={<ArchiveBoxXMarkIcon className="w-8 h-8" />}
        />
        <StatCard 
          title="Movimientos Recientes" 
          value={stats.recentMovements.length}
          icon={<ArrowPathIcon className="w-8 h-8" />}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <LowStockTable products={stats.lowStockProducts} />
      </div>
    </>
  );
};

export default DashboardPage;
