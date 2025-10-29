import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { Branch } from '../types';
import BranchService from '../services/BranchService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Branch>();

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
    if (branch) {
      reset(branch);
      setValue('state', branch.state ?? true);
    } else {
      reset({ name: '', address: '', phone: '', state: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
    reset();
  };

  const onSubmit = async (data: Branch) => {
    const branchData = {
      ...data,
      state: Boolean(data.state)
    };

    const apiCall = selectedBranch
      ? BranchService.updateBranch(selectedBranch.id, branchData)
      : BranchService.createBranch(branchData);

    toast.promise(apiCall, {
      loading: 'Guardando sucursal...',
      success: () => {
        closeModal();
        fetchBranches();
        return 'Sucursal guardada con éxito';
      },
      error: (err) => `Error: ${err.response?.data?.message || err.message}`,
    });
  };

  const handleDelete = async (branch: Branch) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la sucursal "${branch.name}"?`)) {
      toast.promise(BranchService.deleteBranch(branch.id),
        {
          loading: 'Eliminando sucursal...',
          success: () => {
            fetchBranches();
            return 'Sucursal eliminada con éxito';
          },
          error: (err) => `Error: ${err.response?.data?.message || err.message}`,
        }
      );
    }
  };

  const activeBranches = branches.filter(b => b.state);
  const inactiveBranches = branches.filter(b => !b.state);

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Sucursales"
        actionButton={
          <Button onClick={() => openModal()}>
            <PlusCircleIcon className="h-5 w-5 inline mr-2" />
            Nueva Sucursal
          </Button>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Sucursales</p>
              <p className="text-4xl font-bold text-blue-900">{branches.length}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
              <BuildingStorefrontIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Sucursales Activas</p>
              <p className="text-4xl font-bold text-green-900">{activeBranches.length}</p>
            </div>
            <div className="bg-green-500 p-4 rounded-xl shadow-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Sucursales Inactivas</p>
              <p className="text-4xl font-bold text-red-900">{inactiveBranches.length}</p>
            </div>
            <div className="bg-red-500 p-4 rounded-xl shadow-lg">
              <XCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Sucursales Activas */}
      {activeBranches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Sucursales Activas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBranches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Header con gradiente */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-white/10 rounded-full"></div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BuildingStorefrontIcon className="h-8 w-8 text-white" />
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                          ACTIVA
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{branch.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Dirección */}
                  <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Dirección</p>
                        <p className="text-sm text-gray-900 font-medium">{branch.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="mb-5 bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <PhoneIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</p>
                        <p className="text-sm text-gray-900 font-medium">{branch.phone || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(branch)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(branch)}
                      className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Sucursales Inactivas */}
      {inactiveBranches.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Sucursales Inactivas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveBranches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden hover:shadow-2xl transition-all duration-300 opacity-75 hover:opacity-100"
              >
                {/* Header con gradiente gris */}
                <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full"></div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BuildingStorefrontIcon className="h-8 w-8 text-white" />
                        <span className="px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                          INACTIVA
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{branch.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Dirección */}
                  <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Dirección</p>
                        <p className="text-sm text-gray-700 font-medium">{branch.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <PhoneIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</p>
                        <p className="text-sm text-gray-700 font-medium">{branch.phone || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(branch)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(branch)}
                      className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {branches.length === 0 && (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
          <BuildingStorefrontIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-2">No hay sucursales registradas</p>
          <p className="text-gray-400 mb-6">Comienza agregando tu primera sucursal</p>
          <Button onClick={() => openModal()}>
            <PlusCircleIcon className="h-5 w-5 inline mr-2" />
            Crear Primera Sucursal
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
            <div className="flex items-center space-x-3">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-bold text-blue-900">Información de la Sucursal</h4>
                <p className="text-xs text-blue-700">Complete todos los campos requeridos</p>
              </div>
            </div>
          </div>

          <Input 
            label="Nombre de la Sucursal *" 
            {...register('name', { required: 'El nombre es requerido' })} 
            error={errors.name?.message} 
            placeholder="Ej: Sucursal Centro"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Dirección *
            </label>
            <textarea
              {...register('address', { required: 'La dirección es requerida' })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Zona 1, Ciudad de Guatemala"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Teléfono
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="Ej: 2345-6789"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
            <div className="flex items-start space-x-4">
              <input 
                type="checkbox" 
                id="state-checkbox"
                {...register('state')} 
                className="mt-1 h-6 w-6 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="state-checkbox" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-2 mb-1">
                  {watch('state') ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm font-bold text-gray-900">
                    {watch('state') ? 'Sucursal Activa' : 'Sucursal Inactiva'}
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {watch('state') 
                    ? '✅ Esta sucursal está operativa y puede realizar ventas y compras' 
                    : '⚠️ Esta sucursal está desactivada temporalmente'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              {selectedBranch ? 'Guardar Cambios' : 'Crear Sucursal'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default BranchesPage