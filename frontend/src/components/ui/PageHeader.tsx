
import { ReactNode } from 'react';

/**
 * Cabecera estándar para cada página, con un título y un botón de acción opcional.
 */

interface PageHeaderProps {
  title: string;
  actionButton?: ReactNode;
}

const PageHeader = ({ title, actionButton }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default PageHeader;
