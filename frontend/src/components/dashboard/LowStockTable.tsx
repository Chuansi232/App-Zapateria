
import { Product } from '../../types';

/**
 * Tabla que muestra los productos con bajo nivel de stock.
 */

interface LowStockTableProps {
  products: Product[];
}

const LowStockTable = ({ products }: LowStockTableProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-800 mb-4">Productos con Bajo Stock</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className="font-bold text-red-600">{product.stock}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockTable;
