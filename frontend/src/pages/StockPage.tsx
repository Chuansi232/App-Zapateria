import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Stock, Branch } from '../types';
import InventoryService from '../services/InventoryService';
import BranchService from '../services/BranchService';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import { 
  BuildingStorefrontIcon, 
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

/**
 * Página para consultar el stock de productos por sucursal.
 * Versión visualmente mejorada con cards, badges y mejor UX.
 */
const StockPage = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await BranchService.getBranches();
        setBranches(data);
        if (data.length > 0) {
          setSelectedBranch(data[0].id);
        }
      } catch (error) {
        toast.error('No se pudieron cargar las sucursales.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      const fetchStock = async () => {
        setIsLoading(true);
        try {
          const data = await InventoryService.getStockByBranch(selectedBranch);
          setStock(data);
        } catch (error) {
          toast.error(`No se pudo cargar el stock para la sucursal.`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStock();
    }
  }, [selectedBranch]);

  // Calcular totales
  const calculateTotals = () => {
    const totalProducts = stock.length;
    const totalUnits = stock.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = stock.reduce((sum, item) => {
      const price = item.product?.purchasePrice ? Number(item.product.purchasePrice) : 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const lowStock = stock.filter(s => s.quantity <= 5).length;
    const mediumStock = stock.filter(s => s.quantity > 5 && s.quantity <= 10).length;
    const goodStock = stock.filter(s => s.quantity > 10).length;
    
    return { totalProducts, totalUnits, totalValue, lowStock, mediumStock, goodStock };
  };

  const totals = calculateTotals();

  // Función para determinar el estado del stock
  const getStockStatus = (quantity: number) => {
    if (quantity <= 5) {
      return {
        label: 'Crítico',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-red-600',
        barColor: 'bg-red-500'
      };
    } else if (quantity <= 10) {
      return {
        label: 'Bajo',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-600',
        barColor: 'bg-yellow-500'
      };
    } else {
      return {
        label: 'Óptimo',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        iconColor: 'text-green-600',
        barColor: 'bg-green-500'
      };
    }
  };

  const selectedBranchData = branches.find(b => b.id === selectedBranch);

  return (
    <div className="space-y-6">
      <PageHeader title="Consulta de Inventario" />
      
      {/* Selector de sucursal con diseño mejorado */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <BuildingStorefrontIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Selecciona una Sucursal</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select 
              className="w-full p-4 border-2 border-white/30 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-white bg-white/10 backdrop-blur-md text-white font-semibold text-lg transition-all duration-300 hover:bg-white/20"
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(Number(e.target.value))}
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id} className="bg-blue-600 text-white">
                  {branch.name}
                </option>
              ))}
            </select>
            
            {selectedBranchData && (
              <div className="mt-3 text-sm space-y-1 text-white/90">
                <p>📍 {selectedBranchData.address}</p>
                <p>📞 {selectedBranchData.phone}</p>
              </div>
            )}
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      {!isLoading && stock.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Productos */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-500 p-3 rounded-xl">
                <ArchiveBoxIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-purple-600">{totals.totalProducts}</span>
            </div>
            <p className="text-sm font-medium text-purple-800">Productos Únicos</p>
          </div>

          {/* Total Unidades */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500 p-3 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-blue-600">{totals.totalUnits}</span>
            </div>
            <p className="text-sm font-medium text-blue-800">Unidades Totales</p>
          </div>

          {/* Valor Total */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-500 p-3 rounded-xl">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">Q{totals.totalValue.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-sm font-medium text-green-800">Valor Inventario</p>
          </div>

          {/* Estado del Stock */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-orange-800">🔴 Crítico</span>
                <span className="text-sm font-bold text-orange-900">{totals.lowStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-orange-800">🟡 Bajo</span>
                <span className="text-sm font-bold text-orange-900">{totals.mediumStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-orange-800">🟢 Óptimo</span>
                <span className="text-sm font-bold text-orange-900">{totals.goodStock}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : stock.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
          <ArchiveBoxIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-2">No hay productos en stock</p>
          <p className="text-gray-400">Esta sucursal no tiene inventario registrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header de la tabla */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <ArchiveBoxIcon className="h-5 w-5 mr-2" />
              Inventario Detallado
            </h3>
          </div>

          {/* Tabla responsiva */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tallas
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    P. Compra
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    P. Venta
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stock.map((item) => {
                  const status = getStockStatus(item.quantity);
                  const StatusIcon = status.icon;
                  const totalValue = item.product?.purchasePrice 
                    ? Number(item.product.purchasePrice) * item.quantity 
                    : 0;

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {item.product?.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 font-medium">
                          {item.product?.brand?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          {item.product?.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {item.product?.sizes && item.product.sizes.length > 0 
                            ? item.product.sizes.map(s => s.name).join(', ') 
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-700">
                          Q{item.product?.purchasePrice ? Number(item.product.purchasePrice).toFixed(2) : '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-green-600">
                          Q{item.product?.salePrice ? Number(item.product.salePrice).toFixed(2) : '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-2xl font-bold ${
                            item.quantity <= 5 ? 'text-red-600' : 
                            item.quantity <= 10 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {item.quantity}
                          </span>
                          {/* Barra de progreso */}
                          <div className="w-16 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full ${status.barColor} transition-all duration-300`}
                              style={{ width: `${Math.min((item.quantity / 20) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <StatusIcon className={`h-5 w-5 ${status.iconColor}`} />
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-blue-600">
                          Q{totalValue.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer con resumen */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Mostrando <span className="font-bold text-gray-900">{stock.length}</span> productos
              </span>
              <span className="text-sm font-bold text-gray-900">
                Valor total: Q{totals.totalValue.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;