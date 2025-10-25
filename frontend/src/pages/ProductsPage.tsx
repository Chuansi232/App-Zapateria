
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Product, Brand, Category, Size } from '../types';
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

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
            brand: product.brand.id, 
            category: product.category.id, 
            size: product.size.id 
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
    // La data de los selects viene como string, hay que convertirla a número y estructurarla
    const formattedData: Partial<Product> = {
        name: data.name,
        description: data.description,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        brand: { id: Number(data.brand) },
        category: { id: Number(data.category) },
        size: { id: Number(data.size) },
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
      error: 'Ocurrió un error.',
    });
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Product },
    { header: 'Marca', accessor: (item: Product) => item.brand.name },
    { header: 'Categoría', accessor: (item: Product) => item.category.name },
    { header: 'Talla', accessor: (item: Product) => item.size.name },
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
        onDelete={(product) => { /* Implementar borrado */ }}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre" {...register('name', { required: true })} />
          <Input label="Descripción" {...register('description')} />
          <Input label="Precio de Compra" type="number" step="0.01" {...register('purchasePrice', { required: true, valueAsNumber: true })} />
          <Input label="Precio de Venta" type="number" step="0.01" {...register('salePrice', { required: true, valueAsNumber: true })} />
          
          <div>
            <label>Marca</label>
            <select {...register('brand', { required: true })} className="mt-1 block w-full p-2 border rounded">
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label>Categoría</label>
            <select {...register('category', { required: true })} className="mt-1 block w-full p-2 border rounded">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label>Talla</label>
            <select {...register('size', { required: true })} className="mt-1 block w-full p-2 border rounded">
              {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
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
