import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types/request/request';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';

// SVG Icons for a modern touch
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);


const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', data.username);
      await login(data);
      console.log('Login successful, checking localStorage:', localStorage.getItem('user'));
      toast.success('¡Bienvenido!', {
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      navigate('/sales');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.', {
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 transition-all duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Bienvenidos a la zapatería BWC</h1>
          <p className="text-white/70 mt-2">Inicia sesión</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <UserIcon />
            </div>
            <Input
              placeholder="Usuario"
              className="pl-12 w-full bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              {...register('username', { required: 'El nombre de usuario es obligatorio' })}
              error={errors.username?.message}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LockIcon />
            </div>
            <Input
              placeholder="Contraseña"
              type="password"
              className="pl-12 w-full bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              {...register('password', { required: 'La contraseña es obligatoria' })}
              error={errors.password?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full flex justify-center items-center text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:scale-100"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
      <footer className="absolute bottom-4 text-white/40 text-sm">
      </footer>
    </div>
  );
};

export default LoginPage;
