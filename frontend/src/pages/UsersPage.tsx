
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { User } from '../types';
import { Role } from '../types';

import UserService from '../services/UserService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

/**
 * Página para la gestión de usuarios (CRUD).
 * Accesible solo para administradores.
 */
type UserFormData = Omit<User, 'id'> & { password?: string };

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (error) {
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
    reset(user || { username: '', email: '', roles: [Role.ALMACENISTA] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    reset();
  };

  const onSubmit = async (data: UserFormData) => {
    // No enviar el password al actualizar, a menos que se haya implementado un campo para cambiarlo
    const userData = { ...data };
    if (selectedUser) {
      delete userData.password;
    }

    const apiCall = selectedUser
      ? UserService.updateUser(selectedUser.id, userData)
      : UserService.createUser(userData);

    toast.promise(apiCall, {
      loading: selectedUser ? 'Actualizando usuario...' : 'Creando usuario...',
      success: () => {
        closeModal();
        fetchUsers();
        return selectedUser ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito';
      },
      error: 'Ocurrió un error.',
    });
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

  const columns = [
    { header: 'ID', accessor: 'id' as keyof User },
    { header: 'Usuario', accessor: 'username' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Roles', accessor: (item: User) => item.roles.join(', ') },
  ];

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader 
        title="Gestión de Usuarios"
        actionButton={<Button onClick={() => openModal()}>Añadir Usuario</Button>}
      />
      <Table<User> 
        columns={columns}
        data={users}
        onEdit={openModal}
        onDelete={handleDelete}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nombre de Usuario"
            {...register('username', { required: 'Este campo es obligatorio' })}
            error={errors.username?.message}
          />
          <Input 
            label="Email"
            type="email"
            {...register('email', { required: 'Este campo es obligatorio' })}
            error={errors.email?.message}
          />
          {/* En una app real, el password y roles se manejarían de forma más segura y compleja */}
          {!selectedUser && (
             <Input 
                label="Contraseña"
                type="password"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                error={errors.password?.message}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Roles</label>
            <select {...register('roles')} multiple className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value={Role.ADMINISTRADOR}>Administrador</option>
                <option value={Role.VENDEDOR}>Vendedor</option>
                <option value={Role.ALMACENISTA}>Usuario</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{selectedUser ? 'Guardar Cambios' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UsersPage;
