
import type { InputHTMLAttributes } from 'react';

/**
 * Componente de campo de entrada reutilizable.
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, name, error, ...props }: InputProps) => {
  return (
    <div>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={name}
        name={name}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
