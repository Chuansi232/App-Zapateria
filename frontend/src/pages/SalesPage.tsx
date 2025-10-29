import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { Sale, Product, Branch } from '../types';
import SaleService from '../services/SaleService';
import ProductService from '../services/ProductService';
import BranchService from '../services/BranchService';
import InventoryService from '../services/InventoryService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  TrashIcon, 
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UserIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  ChartBarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface SaleFormData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  branchId: number;
  saleDetails: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

interface StockInfo {
  [key: string]: number;
}

const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stockInfo, setStockInfo] = useState<StockInfo>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [expandedSale, setExpandedSale] = useState<number | null>(null);

  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<SaleFormData>({
    defaultValues: {
      saleDetails: [{ productId: 0, quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "saleDetails"
  });

  const watchBranch = watch('branchId');
  const watchDetails = watch('saleDetails');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesData, productsData, branchesData] = await Promise.all([
        SaleService.getSales(),
        ProductService.getProducts(),
        BranchService.getBranches()
      ]);
      setSales(salesData);
      setProducts(productsData);
      setBranches(branchesData);
    } catch (error) {
      toast.error('No se pudieron cargar los datos.');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (watchBranch && watchBranch > 0) {
      loadStockForBranch(watchBranch);
    }
  }, [watchBranch]);

  const loadStockForBranch = async (branchId: number) => {
    setIsLoadingStock(true);
    try {
      const stockData = await InventoryService.getStockByBranch(branchId);
      const stockMap: StockInfo = {};
      stockData.forEach(stock => {
        if (stock.productId) {
          const key = `${stock.productId}-${branchId}`;
          stockMap[key] = stock.quantity;
        }
      });
      setStockInfo(stockMap);
    } catch (error) {
      console.error('Error loading stock:', error);
      toast.error('Error al cargar el inventario de la sucursal');
      setStockInfo({});
    } finally {
      setIsLoadingStock(false);
    }
  };

  const getAvailableStock = (productId: number): number => {
    if (!watchBranch || !productId || productId === 0) return 0;
    const key = `${productId}-${watchBranch}`;
    const stock = stockInfo[key] || 0;
    return stock;
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product && product.salePrice) {
      setValue(`saleDetails.${index}.unitPrice`, Number(product.salePrice));
    }
  };

  const calculateTotal = (): number => {
    return watchDetails.reduce((total, detail) => {
      const qty = detail.quantity || 0;
      const price = detail.unitPrice || 0;
      return total + (qty * price);
    }, 0);
  };

  const openModal = () => {
    const defaultBranchId = branches.length > 0 ? branches[0].id : 0;
    reset({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      branchId: defaultBranchId,
      saleDetails: [{ productId: 0, quantity: 1, unitPrice: 0 }]
    });
    setIsModalOpen(true);
    if (defaultBranchId > 0) {
      loadStockForBranch(defaultBranchId);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setStockInfo({});
  };

  const onSubmit = async (data: SaleFormData) => {
    if (!data.branchId || data.branchId === 0) {
      toast.error('Debe seleccionar una sucursal');
      return;
    }

    for (const detail of data.saleDetails) {
      if (detail.productId === 0) {
        toast.error('Debe seleccionar un producto válido');
        return;
      }

      const available = getAvailableStock(detail.productId);
      if (detail.quantity > available) {
        const product = products.find(p => p.id === detail.productId);
        toast.error(`Stock insuficiente para ${product?.name || 'el producto seleccionado'}. Disponible: ${available}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const saleData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        branchId: data.branchId,
        saleDetails: data.saleDetails.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          totalPrice: detail.quantity * detail.unitPrice
        })),
        totalAmount: calculateTotal()
      };

      await SaleService.createSale(saleData as any);
      toast.success('Venta registrada con éxito');
      closeModal();
      fetchData();
    } catch (error: any) {
      console.error('Error creating sale:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al registrar la venta';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estadísticas
  const totalSalesToday = sales
    .filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const salesThisMonth = sales.filter(s => {
    const saleDate = new Date(s.saleDate);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && 
           saleDate.getFullYear() === now.getFullYear();
  }).length;

  const totalAccumulated = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Ventas"
        actionButton={
          <Button onClick={openModal}>
            <ShoppingCartIcon className="h-5 w-5 inline mr-2" />
            Nueva Venta
          </Button>
        }
      />

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Ventas Hoy</p>
              <p className="text-2xl font-bold text-blue-900">
                Q{totalSalesToday.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Ventas del Mes</p>
              <p className="text-2xl font-bold text-green-900">{salesThisMonth}</p>
            </div>
            <div className="bg-green-500 p-4 rounded-xl shadow-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total Acumulado</p>
              <p className="text-2xl font-bold text-purple-900">
                Q{totalAccumulated.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-purple-500 p-4 rounded-xl shadow-lg">
              <BanknotesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ventas */}
      {sales.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
          <ShoppingCartIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-2">No hay ventas registradas</p>
          <p className="text-gray-400 mb-6">Comienza registrando tu primera venta</p>
          <Button onClick={openModal}>
            <ShoppingCartIcon className="h-5 w-5 inline mr-2" />
            Registrar Primera Venta
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => {
            const isExpanded = expandedSale === sale.id;

            return (
              <div
                key={sale.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Header */}
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 p-6 cursor-pointer"
                  onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                        <ShoppingCartIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Venta #{sale.id}
                        </h3>
                        <p className="text-white/80 text-sm flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(sale.saleDate).toLocaleDateString('es-GT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white/70 text-sm mb-1">Total</p>
                        <p className="text-3xl font-bold text-white">
                          Q{sale.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 bg-emerald-100 text-emerald-800 border-2 border-emerald-300">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Completada</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información básica (siempre visible) */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Cliente</p>
                        <p className="text-sm font-bold text-gray-900">
                          {sale.customer?.name || 'Cliente General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Sucursal</p>
                        <p className="text-sm font-bold text-gray-900">
                          {sale.branch?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <ArchiveBoxIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Productos</p>
                        <p className="text-sm font-bold text-gray-900">
                          {sale.saleDetails?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {isExpanded && sale.saleDetails && (
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                      Detalle de Productos
                    </h4>
                    <div className="space-y-3">
                      {sale.saleDetails.map((detail, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-xl border border-gray-200 hover:border-green-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">
                                {detail.product?.name || `Producto ID: ${detail.productId}`}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <span className="font-semibold mr-1">Cantidad:</span>
                                  {detail.quantity}
                                </span>
                                <span className="flex items-center">
                                  <span className="font-semibold mr-1">Precio Unit:</span>
                                  Q{detail.unitPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Subtotal</p>
                              <p className="text-2xl font-bold text-green-600">
                                Q{detail.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total destacado */}
                    <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-white">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total de la Venta</span>
                        <span className="text-3xl font-bold">
                          Q{sale.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Nueva Venta">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          
          {/* Información del Cliente */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-900 flex items-center mb-4">
              <UserIcon className="h-6 w-6 mr-2" />
              Información del Cliente (Opcional)
            </h4>
            <div className="space-y-3">
              <Input
                label="Nombre"
                {...register('customerName')}
                placeholder="Nombre del cliente"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email"
                  type="email"
                  {...register('customerEmail')}
                  placeholder="email@ejemplo.com"
                />
                <Input
                  label="Teléfono"
                  {...register('customerPhone')}
                  placeholder="2345-6789"
                />
              </div>
            </div>
          </div>

          {/* Sucursal */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <label className="block text-sm font-bold text-green-900 mb-2 flex items-center">
              <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
              Sucursal *
            </label>
            <select
              {...register('branchId', { 
                required: 'La sucursal es requerida',
                valueAsNumber: true
              })}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
            >
              <option value="">Selecciona una sucursal</option>
              {branches.filter(b => b.state).map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {errors.branchId && <p className="text-red-500 text-sm mt-1">{errors.branchId.message}</p>}
            {isLoadingStock && (
              <p className="text-xs text-blue-600 mt-2 animate-pulse">⏳ Cargando inventario...</p>
            )}
          </div>

          {/* Productos */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800 flex items-center">
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                Productos
              </h4>
              <Button
                type="button"
                onClick={() => append({ productId: 0, quantity: 1, unitPrice: 0 })}
                variant="secondary"
                disabled={!watchBranch || watchBranch === 0}
              >
                <PlusIcon className="h-4 w-4 inline mr-1" />
                Agregar
              </Button>
            </div>

            {!watchBranch || watchBranch === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠ Selecciona una sucursal para agregar productos
                </p>
              </div>
            ) : (
              fields.map((field, index) => {
                const detail = watchDetails[index];
                if (!detail) return null;
                
                const selectedProduct = detail.productId;
                const availableStock = getAvailableStock(selectedProduct);
                
                return (
                  <div key={field.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl mb-4 border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-700 bg-white px-3 py-1 rounded-full text-sm">
                        Producto #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-all"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Producto *
                        </label>
                        <select
                          {...register(`saleDetails.${index}.productId`, {
                            required: 'Selecciona un producto',
                            valueAsNumber: true
                          })}
                          onChange={(e) => handleProductChange(index, Number(e.target.value))}
                          className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                        >
                          <option value="">Selecciona un producto</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.brand?.name} - Q{Number(product.salePrice).toFixed(2)}
                            </option>
                          ))}
                        </select>
                        {selectedProduct && selectedProduct > 0 && (
                          <p className={`text-xs mt-1 p-2 rounded ${availableStock > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {availableStock > 0 ? '✅' : '❌'} Stock disponible: {availableStock} unidades
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={availableStock}
                            {...register(`saleDetails.${index}.quantity`, {
                              required: 'Cantidad requerida',
                              valueAsNumber: true,
                              min: { value: 1, message: 'Mínimo 1' },
                              max: { value: availableStock, message: `Máximo ${availableStock}` }
                            })}
                            className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold"
                            placeholder="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio (Q) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`saleDetails.${index}.unitPrice`, {
                              required: 'Precio requerido',
                              valueAsNumber: true,
                              min: { value: 0.01, message: 'Mínimo Q0.01' }
                            })}
                            className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {detail.quantity > 0 && detail.unitPrice > 0 && (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-xl border-2 border-green-300 text-right">
                          <span className="text-sm font-semibold text-green-700">Subtotal: </span>
                          <span className="text-xl font-bold text-green-900">
                            Q{(detail.quantity * detail.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white/80 mb-1">Total de la Venta</p>
                <p className="text-4xl font-bold">Q{calculateTotal().toFixed(2)}</p>
              </div>
              <CurrencyDollarIcon className="h-16 w-16 text-white/30" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !watchBranch || watchBranch === 0}>
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              {isSubmitting ? 'Procesando...' : 'Registrar Venta'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SalesPage;