import type { InventoryMovement } from '../../types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Definición de las propiedades del componente con TypeScript
interface RecentMovementsTableProps {
  movements: InventoryMovement[];
}

/**
 * Tabla que muestra los movimientos de inventario más recientes (entradas/salidas).
 */
const RecentMovementsTable = ({ movements }: RecentMovementsTableProps) => {

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/20">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Producto ID</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Cantidad</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Sucursal ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {movements.map((movement) => {
            const isEntry = movement.movementTypeId === 1;
            const typeText = isEntry ? 'ENTRADA' : 'SALIDA';
            return (
              <tr key={movement.id} className="hover:bg-white/10 transition-colors duration-200">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                  {new Date(movement.movementDate).toLocaleString('es-MX', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                  {movement.productId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isEntry ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {typeText}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-white">
                  {movement.quantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                  {movement.branchId}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12 text-white/60">
      <ArrowPathIcon className="h-12 w-12 mx-auto mb-3 text-white/40" />
      <p className="font-semibold">No hay movimientos recientes</p>
      <p className="text-sm">Las últimas entradas y salidas aparecerán aquí.</p>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg h-full">
      <h3 className="font-semibold text-white text-lg mb-4">Movimientos Recientes</h3>
      {movements.length === 0 ? renderEmptyState() : renderTable()}
    </div>
  );
};

export default RecentMovementsTable;