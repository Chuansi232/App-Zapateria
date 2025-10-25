
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Stock, Branch } from '../types';
import InventoryService from '../services/InventoryService';
import BranchService from '../services/BranchService';
import PageHeader from '../components/ui/PageHeader';
import Table from '../components/ui/Table';
import Spinner from '../components/ui/Spinner';

/**
 * Página para consultar el stock de productos por sucursal.
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

  const columns = [
    { header: 'Producto', accessor: (item: Stock) => item.product?.name || 'N/A' },
    { header: 'Marca', accessor: (item: Stock) => item.product?.brand?.name || 'N/A' },
    { 
      header: 'Tallas', 
      accessor: (item: Stock) => 
        item.product?.sizes?.map(s => s.name).join(', ') || 'N/A'
    },
    { header: 'Cantidad', accessor: 'quantity' as keyof Stock },
  ];

  return (
    <>
      <PageHeader title="Consulta de Stock" />
      <div className="mb-4">
        <label htmlFor="branch-select" className="block text-sm font-medium text-gray-700">Selecciona una Sucursal</label>
        <select 
          id="branch-select"
          className="mt-1 block w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
          value={selectedBranch || ''}
          onChange={(e) => setSelectedBranch(Number(e.target.value))}
        >
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? <Spinner /> : <Table<Stock> columns={columns} data={stock} />}
    </>
  );
};

export default StockPage;
