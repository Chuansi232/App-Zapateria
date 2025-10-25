
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Gráfico de barras para mostrar ventas (datos de ejemplo).
 */

const data = [
  { name: 'Lunes', ventas: 4000 },
  { name: 'Martes', ventas: 3000 },
  { name: 'Miércoles', ventas: 2000 },
  { name: 'Jueves', ventas: 2780 },
  { name: 'Viernes', ventas: 1890 },
  { name: 'Sábado', ventas: 2390 },
  { name: 'Domingo', ventas: 3490 },
];

const SalesChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">Ventas de la Semana</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#3b82f6" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
