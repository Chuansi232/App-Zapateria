import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { Product, Brand, Category, Size } from '../types';
import ProductService from '../services/ProductService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  ArchiveBoxIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Product>();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsData, brandsData, categoriesData, sizesData] = await Promise.all([
        ProductService.getProducts(),
        ProductService.getBrands(),
        ProductService.getCategories(),
        ProductService.getSizes(),
      ]);
      setProducts(productsData);
      setBrands(brandsData);
      setCategories(categoriesData);
      setSizes(sizesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    if (product) {
        reset({ 
            ...product, 
            brandId: product.brand?.id, 
            categoryId: product.category?.id, 
            sizeIds: product.sizes?.map(s => s.id),
            purchasePrice: product.purchasePrice,
            salePrice: product.salePrice
        });
    } else {
        reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    const formattedData = {
      name: data.name,
      description: data.description,
      brandId: Number(data.brandId),
      categoryId: Number(data.categoryId),
      sizeIds: Array.isArray(data.sizeIds) 
        ? data.sizeIds.map((id: string) => Number(id))
        : [Number(data.sizeIds)],
      purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : 0,
      salePrice: data.salePrice ? Number(data.salePrice) : 0
    };

    const apiCall = selectedProduct
      ? ProductService.updateProduct(selectedProduct.id, formattedData)
      : ProductService.createProduct(formattedData);

    toast.promise(apiCall, {
      loading: 'Guardando producto...',
      success: () => {
        closeModal();
        fetchData();
        return 'Producto guardado con éxito';
      },
      error: (err) => {
        console.error('Error saving product:', err);
        return `Error: ${err.response?.data?.message || err.message}`;
      },
    });
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) {
      toast.promise(ProductService.deleteProduct(product.id),
        {
          loading: 'Eliminando producto...',
          success: () => {
            fetchData();
            return 'Producto eliminado con éxito';
          },
          error: (err) => `Error: ${err.response?.data?.message || err.message}`,
        }
      );
    }
  };

  // Filtrado de productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category?.id === Number(filterCategory);
    const matchesBrand = !filterBrand || product.brand?.id === Number(filterBrand);
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const getStockBadge = (stock: number) => {
    if (stock <= 5) return { color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon, label: 'Crítico' };
    if (stock <= 10) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ExclamationTriangleIcon, label: 'Bajo' };
    return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon, label: 'Óptimo' };
  };

  const calculateProfit = (purchase: number, sale: number) => {
    const profit = sale - purchase;
    const percentage = ((profit / purchase) * 100).toFixed(1);
    return { profit, percentage };
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Productos"
        actionButton={
          <Button onClick={() => openModal()}>
            <SparklesIcon className="h-5 w-5 inline mr-2" />
            Nuevo Producto
          </Button>
        }
      />

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Productos</p>
              <p className="text-3xl font-bold text-blue-900">{products.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <ArchiveBoxIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Stock Total</p>
              <p className="text-3xl font-bold text-green-900">
                {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <CheckCircleIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Categorías</p>
              <p className="text-3xl font-bold text-purple-900">{categories.length}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <TagIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Marcas</p>
              <p className="text-3xl font-bold text-amber-900">{brands.length}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-xl">
              <SparklesIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Filtro por Categoría */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Marca */}
          <div>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            >
              <option value="">Todas las marcas</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando <span className="font-bold text-gray-900">{filteredProducts.length}</span> de {products.length} productos
        </div>
      </div>

      {/* Grid de productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
          <ArchiveBoxIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-2">No se encontraron productos</p>
          <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockBadge = getStockBadge(product.stock || 0);
            const StockIcon = stockBadge.icon;
            const profitData = calculateProfit(
              Number(product.purchasePrice || 0),
              Number(product.salePrice || 0)
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header con categoría */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                      {product.category?.name || 'Sin categoría'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stockBadge.color} flex items-center space-x-1`}>
                      <StockIcon className="h-3 w-3" />
                      <span>{stockBadge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  {/* Nombre y marca */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <TagIcon className="h-4 w-4 mr-1" />
                      {product.brand?.name || 'Sin marca'}
                    </p>
                  </div>

                  {/* Tallas */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Tallas disponibles:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map(size => (
                          <span
                            key={size.id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                          >
                            {size.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Precios */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Compra</p>
                      <p className="text-lg font-bold text-blue-900">
                        Q{Number(product.purchasePrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">Venta</p>
                      <p className="text-lg font-bold text-green-900">
                        Q{Number(product.salePrice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Margen de ganancia */}
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-purple-700">Margen</span>
                      <span className="text-sm font-bold text-purple-900">
                        +{profitData.percentage}% (Q{profitData.profit.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="bg-gray-50 p-3 rounded-xl mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Stock Total</span>
                      <span className="text-2xl font-bold text-gray-900">{product.stock || 0}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(product)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <Input
            label="Nombre *"
            {...register('name', { required: 'El nombre es requerido' })}
            error={errors.name?.message as string}
            placeholder="Ej: Zapato Deportivo Nike"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <select
              {...register('brandId', { required: 'La marca es requerida' })}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una marca</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              {...register('categoryId', { required: 'La categoría es requerida' })}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tallas * <span className="text-gray-500 text-xs font-normal">(Mantén Ctrl/Cmd para seleccionar múltiples)</span>
            </label>
            <select
              {...register('sizeIds', { required: 'Selecciona al menos una talla' })}
              multiple
              size={6}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {sizes.map(s => (
                <option key={s.id} value={s.id} className="py-1">Talla {s.name}</option>
              ))}
            </select>
            {errors.sizeIds && <p className="text-red-500 text-sm mt-1">{errors.sizeIds.message as string}</p>}
            <p className="text-xs text-gray-500 mt-1">💡 Tip: Usa Ctrl+Click (Cmd+Click en Mac) para seleccionar varias tallas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Compra (Q) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">Q</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('purchasePrice', { 
                    required: 'El precio de compra es requerido',
                    min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                  })}
                  className="pl-8 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Venta (Q) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">Q</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('salePrice', { 
                    required: 'El precio de venta es requerido',
                    min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                  })}
                  className="pl-8 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              {errors.salePrice && <p className="text-red-500 text-sm mt-1">{errors.salePrice.message as string}</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">📝 Nota:</p>
            <p>El stock se gestionará a través del módulo de inventario por sucursal.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {selectedProduct ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProductsPage;