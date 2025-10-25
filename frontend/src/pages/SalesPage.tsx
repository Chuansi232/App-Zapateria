
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Sale } from '../types';
import SaleService from '../services/SaleService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Spinner from '../components/ui/Spinner';

/**
 * Página para visualizar las ventas.
 */
const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const data = await SaleService.getSales();
      setSales(data);
    } catch (error) {
      toast.error('No se pudieron cargar las ventas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Sale },
    { header: 'Fecha', accessor: (item: Sale) => new Date(item.date).toLocaleDateString() },
    { header: 'Cliente', accessor: (item: Sale) => item.customer.name },
    { header: 'Sucursal', accessor: (item: Sale) => item.branch.name },
    { header: 'Total', accessor: (item: Sale) => `$${item.total.toFixed(2)}` },
  ];

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Historial de Ventas"
        actionButton={<Button onClick={() => alert('Implementar formulario de nueva venta')}>Registrar Venta</Button>}
      />
      <Table<Sale> 
        columns={columns}
        data={sales}
      />
    </>
  );
};

export default SalesPage;
