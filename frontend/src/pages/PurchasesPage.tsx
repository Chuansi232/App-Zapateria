
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Purchase } from '../types';
import PurchaseService from '../services/PurchaseService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Spinner from '../components/ui/Spinner';

/**
 * Página para visualizar las compras a proveedores.
 */
const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const data = await PurchaseService.getPurchases();
      setPurchases(data);
    } catch (error) {
      toast.error('No se pudieron cargar las compras.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Purchase },
    { 
      header: 'Fecha', 
      accessor: (item: Purchase) => new Date(item.purchaseDate).toLocaleDateString() 
    },
    { 
      header: 'Proveedor', 
      accessor: (item: Purchase) => item.supplier?.name || `ID: ${item.supplierId}` 
    },
    { 
      header: 'Total', 
      accessor: (item: Purchase) => `Q${item.totalAmount.toFixed(2)}` 
    },
  ];

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Historial de Compras"
        actionButton={<Button onClick={() => alert('Implementar formulario de nueva compra')}>Registrar Compra</Button>}
      />
      <Table<Purchase> 
        columns={columns}
        data={purchases}
      />
    </>
  );
};

export default PurchasesPage;
