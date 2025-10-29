import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { User } from '../types';
import { Role } from '../types';
import UserService from '../services/UserService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  UserCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  KeyIcon,
  SparklesIcon,
  UserGroupIcon,
  CpuChipIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

type UserFormData = Omit<User, 'id'> & { password?: string };

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: User | null = null) => {
    setSelectedUser(user);
    if (user) {
      reset(user);
      setSelectedRoles(user.roles || []);
    } else {
      reset({ username: '', email: '', password: '', roles: [] });
      setSelectedRoles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSelectedRoles([]);
    reset();
  };

  const handleRoleChange = (roleValue: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRoles(prev => [...prev, roleValue]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== roleValue));
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      // Validar que al menos un rol esté seleccionado
      if (!selectedRoles || selectedRoles.length === 0) {
        toast.error('Debes seleccionar al menos un rol');
        return;
      }

      // Construir el objeto de usuario con los roles seleccionados
      const userData: any = {
        username: data.username,
        email: data.email,
        roles: selectedRoles
      };

      // Solo incluir password si estamos creando un nuevo usuario
      if (!selectedUser && data.password) {
        userData.password = data.password;
      }

      console.log('Datos a enviar:', userData); // Para debugging

      let response;
      if (selectedUser) {
        response = await UserService.updateUser(selectedUser.id, userData);
        toast.success('Usuario actualizado con éxito');
      } else {
        response = await UserService.createUser(userData);
        toast.success('Usuario creado con éxito');
      }

      console.log('Respuesta del servidor:', response); // Para debugging
      
      closeModal();
      fetchUsers();
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Respuesta del error:', error.response);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        // Aquí podrías redirigir al login si tienes un método para eso
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error al guardar el usuario';
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.username}?`)) {
      toast.promise(UserService.deleteUser(user.id), {
        loading: 'Eliminando usuario...',
        success: () => {
          fetchUsers();
          return 'Usuario eliminado con éxito';
        },
        error: (err) => `Error: ${err.response?.data?.message || err.message}`,
      });
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case Role.ADMINISTRADOR:
        return { 
          name: 'Administrador', 
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: ShieldCheckIcon,
          gradient: 'from-purple-500 to-purple-600'
        };
      case Role.VENDEDOR:
        return { 
          name: 'Vendedor', 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ShoppingBagIcon,
          gradient: 'from-blue-500 to-blue-600'
        };
      case Role.ALMACENISTA:
        return { 
          name: 'Almacenista', 
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: CpuChipIcon,
          gradient: 'from-green-500 to-green-600'
        };
      default:
        return { 
          name: 'Usuario', 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: UserCircleIcon,
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const getUsersByRole = (role: string) => {
    return users.filter(user => user.roles.includes(role));
  };

  const admins = getUsersByRole(Role.ADMINISTRADOR);
  const sellers = getUsersByRole(Role.VENDEDOR);
  const warehouse = getUsersByRole(Role.ALMACENISTA);

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Usuarios"
        actionButton={
          <Button onClick={() => openModal()}>
            <UserPlusIcon className="h-5 w-5 inline mr-2" />
            Nuevo Usuario
          </Button>
        }
      />

      {/* Estadísticas por Rol */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">Total Usuarios</p>
              <p className="text-4xl font-bold text-indigo-900">{users.length}</p>
            </div>
            <div className="bg-indigo-500 p-4 rounded-xl shadow-lg">
              <UserGroupIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Administradores</p>
              <p className="text-4xl font-bold text-purple-900">{admins.length}</p>
            </div>
            <div className="bg-purple-500 p-4 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Vendedores</p>
              <p className="text-4xl font-bold text-blue-900">{sellers.length}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
              <ShoppingBagIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Almacenistas</p>
              <p className="text-4xl font-bold text-green-900">{warehouse.length}</p>
            </div>
            <div className="bg-green-500 p-4 rounded-xl shadow-lg">
              <CpuChipIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const primaryRole = user.roles[0];
          const roleInfo = getRoleInfo(primaryRole);
          const RoleIcon = roleInfo.icon;

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Header con gradiente según rol */}
              <div className={`bg-gradient-to-r ${roleInfo.gradient} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-white/10 rounded-full"></div>
                
                <div className="relative z-10">
                  {/* Avatar y badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                      <UserCircleIcon className="h-16 w-16 text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {user.roles.map((role, idx) => {
                        const info = getRoleInfo(role);
                        return (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center space-x-1"
                          >
                            <info.icon className="h-3 w-3" />
                            <span>{info.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nombre de usuario */}
                  <h3 className="text-2xl font-bold text-white mb-1">{user.username}</h3>
                  <p className="text-white/80 text-sm">ID: #{user.id}</p>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Email */}
                <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Información de roles */}
                <div className="mb-5 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <RoleIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rol Principal</p>
                      <p className="text-sm font-bold text-purple-900">{roleInfo.name}</p>
                      {user.roles.length > 1 && (
                        <p className="text-xs text-purple-600 mt-1">
                          +{user.roles.length - 1} rol{user.roles.length - 1 > 1 ? 'es' : ''} adicional{user.roles.length - 1 > 1 ? 'es' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(user)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
          <UserGroupIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-2">No hay usuarios registrados</p>
          <p className="text-gray-400 mb-6">Comienza agregando tu primer usuario</p>
          <Button onClick={() => openModal()}>
            <UserPlusIcon className="h-5 w-5 inline mr-2" />
            Crear Primer Usuario
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200 mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <UserCircleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">
                  {selectedUser ? 'Actualizar información del usuario' : 'Crear nuevo usuario'}
                </h4>
                <p className="text-xs text-indigo-700">Complete todos los campos requeridos</p>
              </div>
            </div>
          </div>

          {/* Nombre de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <UserCircleIcon className="h-4 w-4 inline mr-1" />
              Nombre de Usuario *
            </label>
            <input
              {...register('username', { required: 'Este campo es obligatorio' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="usuario123"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              {...register('email', { required: 'Este campo es obligatorio' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="usuario@ejemplo.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Contraseña (solo en creación) */}
          {!selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <KeyIcon className="h-4 w-4 inline mr-1" />
                Contraseña *
              </label>
              <input
                type="password"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
          )}

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
              Roles del Usuario *
            </label>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {[
                { value: Role.ADMINISTRADOR, label: 'Administrador', desc: 'Acceso total al sistema', color: 'purple' },
                { value: Role.VENDEDOR, label: 'Vendedor', desc: 'Gestión de ventas', color: 'blue' },
                { value: Role.ALMACENISTA, label: 'Almacenista', desc: 'Gestión de inventario', color: 'green' }
              ].map((role) => {
                const info = getRoleInfo(role.value);
                const RoleIconComponent = info.icon;
                const isChecked = selectedRoles.includes(role.value);
                
                return (
                  <label
                    key={role.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isChecked 
                        ? `bg-${role.color}-50 border-${role.color}-300` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={role.value}
                      checked={isChecked}
                      onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                      className={`mt-1 h-5 w-5 text-${role.color}-600 border-gray-300 rounded focus:ring-${role.color}-500`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <RoleIconComponent className={`h-5 w-5 text-${role.color}-600`} />
                        <span className="text-sm font-bold text-gray-900">{role.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{role.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedRoles.length === 0 && (
              <p className="text-amber-600 text-sm mt-1">⚠️ Selecciona al menos un rol</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UsersPage;