
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { Product, Brand, Category, Size } from '../types';
import ProductService from '../services/ProductService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

/**
 * Página para la gestión de productos (CRUD).
 * Accesible solo para administradores.
 */
const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
            sizeIds: product.sizes?.map(s => s.id) 
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
        : [Number(data.sizeIds)]
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
      error: (err) => `Error: ${err.response?.data?.message || err.message}`,
    });
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Product },
    { header: 'Marca', accessor: (item: Product) => item.brand?.name },
    { header: 'Categoría', accessor: (item: Product) => item.category?.name },
    { header: 'Talla', accessor: (item: Product) => item.sizes?.map(s => s.name).join(', ') },
    { header: 'Precio Venta', accessor: 'salePrice' as keyof Product },
    { header: 'Stock Total', accessor: 'stock' as keyof Product },
  ];

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Productos"
        actionButton={<Button onClick={() => openModal()}>Añadir Producto</Button>}
      />
      <Table<Product> 
        columns={columns}
        data={products}
        onEdit={openModal}
        onDelete={async (product) => {
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
        }}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            {...register('name', { required: 'El nombre es requerido' })}
            error={errors.name?.message as string}
          />
          <Input label="Descripción" {...register('description')} />

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select
              {...register('brandId', { required: 'La marca es requerida' })}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">Selecciona una marca</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              {...register('categoryId', { required: 'La categoría es requerida' })}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tallas (Mantén Ctrl/Cmd para seleccionar múltiples)
            </label>
            <select
              {...register('sizeIds', { required: 'Selecciona al menos una talla' })}
              multiple
              size={5}
              className="mt-1 block w-full p-2 border rounded"
            >
              {sizes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.sizeIds && <p className="text-red-500 text-sm mt-1">{errors.sizeIds.message as string}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProductsPage;
