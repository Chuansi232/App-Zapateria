import type { Product } from '../../types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Tabla que muestra los productos con bajo nivel de stock.
 */

interface LowStockTableProps {
  products: Product[];
}

const LowStockTable = ({ products }: LowStockTableProps) => {
  const getStockLevel = (stock: number) => {
    if (stock <= 3) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Crítico' };
    if (stock <= 5) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Bajo' };
    return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medio' };
  };

  if (products.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">Productos con Bajo Stock</h3>
        <div className="text-center py-8 text-gray-500">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No hay productos con bajo stock</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Productos con Bajo Stock</h3>
        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tallas</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => {
              const level = getStockLevel(product.stock || 0);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {product.brand?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {product.sizes && product.sizes.length > 0 
                      ? product.sizes.map(s => s.name).join(', ') 
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`text-sm font-bold ${level.color}`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700">
                    Q{product.salePrice ? Number(product.salePrice).toFixed(2) : '0.00'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${level.bg} ${level.color}`}>
                      {level.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockTable;