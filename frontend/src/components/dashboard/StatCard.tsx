import type { ReactNode } from 'react';

/**
 * Tarjeta para mostrar una estadística principal en el dashboard.
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20 cursor-pointer overflow-hidden">
      <div className="z-10">
        <p className="text-sm font-medium text-white/70">{title}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
      </div>
      <div className="z-10">
        {icon}
      </div>
      {/* Efecto de brillo sutil */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );
};

export default StatCard;