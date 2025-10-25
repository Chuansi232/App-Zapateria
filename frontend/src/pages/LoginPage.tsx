
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types/request';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Página de inicio de sesión.
 */
const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch (error) {
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="Usuario"
            {...register('username', { required: 'El nombre de usuario es obligatorio' })}
            error={errors.username?.message}
          />
          <Input 
            label="Contraseña"
            type="password"
            {...register('password', { required: 'La contraseña es obligatoria' })}
            error={errors.password?.message}
          />
          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
