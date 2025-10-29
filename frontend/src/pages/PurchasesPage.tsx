import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { Purchase, Product, Branch } from '../types';
import PurchaseService from '../services/PurchaseService';
import ProductService from '../services/ProductService';
import BranchService from '../services/BranchService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  TrashIcon, 
  PlusIcon, 
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface PurchaseFormData {
  supplierName: string;
  supplierContact?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  branchId: number;
  purchaseDetails: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);

  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<PurchaseFormData>({
    defaultValues: {
      purchaseDetails: [{ productId: 0, quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseDetails"
  });

  const watchDetails = watch('purchaseDetails');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [purchasesData, productsData, branchesData] = await Promise.all([
        PurchaseService.getPurchases(),
        ProductService.getProducts(),
        BranchService.getBranches()
      ]);
      setPurchases(purchasesData);
      setProducts(productsData);
      setBranches(branchesData);
    } catch (error) {
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product && product.purchasePrice) {
      setValue(`purchaseDetails.${index}.unitPrice`, Number(product.purchasePrice));
    }
  };

  const calculateTotal = (): number => {
    return watchDetails.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitPrice);
    }, 0);
  };

  const openModal = () => {
    reset({
      supplierName: '',
      supplierContact: '',
      supplierPhone: '',
      supplierEmail: '',
      branchId: branches.length > 0 ? branches[0].id : 0,
      purchaseDetails: [{ productId: 0, quantity: 1, unitPrice: 0 }]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: PurchaseFormData) => {
    setIsSubmitting(true);
    try {
      const purchaseData = {
        supplierName: data.supplierName,
        supplierContact: data.supplierContact,
        supplierPhone: data.supplierPhone,
        supplierEmail: data.supplierEmail,
        branchId: data.branchId,
        purchaseDetails: data.purchaseDetails.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          totalPrice: detail.quantity * detail.unitPrice
        })),
        totalAmount: calculateTotal()
      };

      await PurchaseService.createPurchase(purchaseData as any);
      toast.success('Compra registrada con éxito. Stock actualizado.');
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar la compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estadísticas
  const totalPurchasesThisMonth = purchases
    .filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      const now = new Date();
      return purchaseDate.getMonth() === now.getMonth() && 
             purchaseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalInvestment = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Compras"
        actionButton={
          <Button onClick={openModal}>
            <TruckIcon className="h-5 w-5 inline mr-2" />
            Nueva Compra
          </Button>
        }
      />

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Compras del Mes</p>
              <p className="text-2xl font-bold text-blue-900">
                Q{totalPurchasesThisMonth.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
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
              <p className="text-sm font-medium text-green-600 mb-1">Total Compras</p>
              <p className="text-2xl font-bold text-green-900">{purchases.length}</p>
            </div>
            <div className="bg-green-500 p-4 rounded-xl shadow-lg">
              <ShoppingCartIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Inversión Total</p>
              <p className="text-2xl font-bold text-purple-900">
                Q{totalInvestment.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-purple-500 p-4 rounded-xl shadow-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Compras */}
      {purchases.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
          <TruckIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-2">No hay compras registradas</p>
          <p className="text-gray-400 mb-6">Comienza registrando tu primera compra</p>
          <Button onClick={openModal}>
            <TruckIcon className="h-5 w-5 inline mr-2" />
            Registrar Primera Compra
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const isExpanded = expandedPurchase === purchase.id;
            const statusName = purchase.paymentStatus?.name || 'PENDIENTE';
            const isCompleted = statusName.toUpperCase().includes('PAGAD');

            return (
              <div
                key={purchase.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Header */}
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 cursor-pointer"
                  onClick={() => setExpandedPurchase(isExpanded ? null : purchase.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                        <TruckIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Compra #{purchase.id}
                        </h3>
                        <p className="text-white/80 text-sm flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(purchase.purchaseDate).toLocaleDateString('es-GT', {
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
                          Q{purchase.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 ${
                        isCompleted 
                          ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                          : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <ClockIcon className="h-5 w-5" />
                        )}
                        <span>{isCompleted ? 'Pagada' : 'Pendiente'}</span>
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
                        <p className="text-xs font-semibold text-gray-500 uppercase">Proveedor</p>
                        <p className="text-sm font-bold text-gray-900">
                          {purchase.supplier?.name || 'Proveedor General'}
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
                          {purchase.branch?.name || 'N/A'}
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
                          {purchase.purchaseDetails?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {isExpanded && purchase.purchaseDetails && (
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                      Detalle de Productos
                    </h4>
                    <div className="space-y-3">
                      {purchase.purchaseDetails.map((detail, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
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
                              <p className="text-2xl font-bold text-blue-600">
                                Q{detail.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total destacado */}
                    <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-xl text-white">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total de la Compra</span>
                        <span className="text-3xl font-bold">
                          Q{purchase.totalAmount.toFixed(2)}
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
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Nueva Compra">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          
          {/* Información del Proveedor */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
            <h4 className="font-bold text-purple-900 flex items-center mb-4">
              <TruckIcon className="h-6 w-6 mr-2" />
              Información del Proveedor
            </h4>
            <div className="space-y-3">
              <Input
                label="Nombre del Proveedor *"
                {...register('supplierName', { required: 'El nombre es requerido' })}
                error={errors.supplierName?.message}
                placeholder="Ej: Distribuidora XYZ"
              />
              <Input
                label="Contacto"
                {...register('supplierContact')}
                placeholder="Nombre del contacto"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Teléfono"
                  {...register('supplierPhone')}
                  placeholder="2345-6789"
                />
                <Input
                  label="Email"
                  type="email"
                  {...register('supplierEmail')}
                  placeholder="proveedor@email.com"
                />
              </div>
            </div>
          </div>

          {/* Sucursal de Destino */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center">
              <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
              Sucursal de Destino *
            </label>
            <select
              {...register('branchId', { 
                required: 'La sucursal es requerida',
                valueAsNumber: true 
              })}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            >
              <option value="">Selecciona una sucursal</option>
              {branches.filter(b => b.state).map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {errors.branchId && <p className="text-red-500 text-sm mt-1">{errors.branchId.message}</p>}
            <p className="text-xs text-blue-700 mt-2">
              📦 Los productos se agregarán al inventario de esta sucursal
            </p>
          </div>

          {/* Productos */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800 flex items-center">
                <ArchiveBoxIcon className="h-6 w-6 mr-2" />
                Productos a Comprar
              </h4>
              <Button
                type="button"
                onClick={() => append({ productId: 0, quantity: 1, unitPrice: 0 })}
                variant="secondary"
              >
                <PlusIcon className="h-4 w-4 inline mr-1" />
                Agregar
              </Button>
            </div>

            {fields.map((field, index) => {
              const selectedProductId = watchDetails[index]?.productId;
              const selectedProduct = products.find(p => p.id === selectedProductId);
              
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
                        {...register(`purchaseDetails.${index}.productId` as const, {
                          required: 'Selecciona un producto',
                          valueAsNumber: true
                        })}
                        onChange={(e) => handleProductChange(index, Number(e.target.value))}
                        className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      >
                        <option value="">Selecciona un producto</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.brand?.name}
                          </option>
                        ))}
                      </select>
                      {selectedProduct && (
                        <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">
                          💡 Precio de compra sugerido: Q{Number(selectedProduct.purchasePrice || 0).toFixed(2)}
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
                          {...register(`purchaseDetails.${index}.quantity` as const, {
                            required: 'Cantidad requerida',
                            valueAsNumber: true,
                            min: { value: 1, message: 'Mínimo 1' }
                          })}
                          className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
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
                          min="0.01"
                          {...register(`purchaseDetails.${index}.unitPrice` as const, {
                            required: 'Precio requerido',
                            valueAsNumber: true,
                            min: { value: 0.01, message: 'Mínimo Q0.01' }
                          })}
                          className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {watchDetails[index] && watchDetails[index].quantity > 0 && watchDetails[index].unitPrice > 0 && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl border-2 border-purple-300 text-right">
                        <span className="text-sm font-semibold text-purple-700">Subtotal: </span>
                        <span className="text-xl font-bold text-purple-900">
                          Q{(watchDetails[index].quantity * watchDetails[index].unitPrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white/80 mb-1">Total de la Compra</p>
                <p className="text-4xl font-bold">Q{calculateTotal().toFixed(2)}</p>
              </div>
              <CurrencyDollarIcon className="h-16 w-16 text-white/30" />
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-sm text-yellow-800">
            <p className="font-bold mb-1 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Confirmación
            </p>
            <p>Los productos se agregarán automáticamente al inventario de la sucursal seleccionada.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Registrar Compra'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default PurchasesPage;