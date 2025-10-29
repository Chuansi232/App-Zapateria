import { Dialog, Transition } from '@headlessui/react';
import { Fragment, type ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal reutilizable con Headless UI
 * - Accesible (usa `Dialog`)
 * - Con animaciones suaves
 * - Cierra al presionar fuera o con el ícono ✕
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Fondo oscuro con animación */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Contenido del modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Título e ícono de cierre */}
                <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Cerrar modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Contenido dinámico */}
                <div className="mt-2">{children}</div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
