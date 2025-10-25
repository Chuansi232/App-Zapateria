
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Branch } from '../types';
import BranchService from '../services/BranchService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

/**
 * Página para la gestión de sucursales (CRUD).
 * Accesible solo para administradores.
 */
const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Branch>();

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const data = await BranchService.getBranches();
      setBranches(data);
    } catch (error) {
      toast.error('No se pudieron cargar las sucursales.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openModal = (branch: Branch | null = null) => {
    setSelectedBranch(branch);
    reset(branch || { name: '', address: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
    reset();
  };

  const onSubmit = async (data: Branch) => {
    const apiCall = selectedBranch
      ? BranchService.updateBranch(selectedBranch.id, data)
      : BranchService.createBranch(data);

    toast.promise(apiCall, {
      loading: 'Guardando sucursal...',
      success: () => {
        closeModal();
        fetchBranches();
        return 'Sucursal guardada con éxito';
      },
      error: 'Ocurrió un error.',
    });
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Branch },
    { header: 'Dirección', accessor: 'address' as keyof Branch },
    { header: 'Teléfono', accessor: 'phone' as keyof Branch },
    { header: 'Estado', accessor: (item: Branch) => item.state ? 'Activa' : 'Inactiva' },
  ];

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Sucursales"
        actionButton={<Button onClick={() => openModal()}>Añadir Sucursal</Button>}
      />
      <Table<Branch> 
        columns={columns}
        data={branches}
        onEdit={openModal}
        onDelete={(branch) => { /* Implementar borrado */ }}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre" {...register('name', { required: true })} error={errors.name?.message} />
          <Input label="Dirección" {...register('address', { required: true })} error={errors.address?.message} />
          <Input label="Teléfono" {...register('phone')} />
          <div className="flex items-center">
            <input type="checkbox" {...register('state')} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-900">Activa</label>
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

export default BranchesPage;
