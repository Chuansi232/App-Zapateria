
import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Componente de botón reutilizable con estilos personalizables.
 */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button = ({ children, variant = 'primary', isLoading = false, ...props }: ButtonProps) => {
  const baseStyle = 'px-4 py-2 rounded-md font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${disabledStyle}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  );
};

export default Button;
