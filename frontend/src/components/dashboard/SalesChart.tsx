import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SalesChartData } from '../../types';

/**
 * Gráfico de barras para mostrar ventas de la última semana.
 * Ahora usa datos reales del backend en lugar de datos mock.
 */

interface SalesChartProps {
  data: SalesChartData[];
}

const SalesChart = ({ data }: SalesChartProps) => {
  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">Ventas de la Semana</h3>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>No hay datos de ventas disponibles</p>
        </div>
      </div>
    );
  }

  // Transformar los datos para que Recharts pueda usarlos
  const chartData = data.map(item => ({
    name: item.day,
    ventas: item.amount
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-800 mb-4">Ventas de la Semana</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          />
          <Tooltip 
            formatter={(value: number) => [`Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Ventas']}
          />
          <Legend />
          <Bar dataKey="ventas" fill="#3b82f6" name="Ventas (Q)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;