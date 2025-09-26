import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

const LogoutConfirmationModal = ({ isOpen, onCancel }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen && !isLoggingOut) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel, isLoggingOut]);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoggingOut) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-200 scale-100">
        <div className="p-6">
          {/* Icono y Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¿Cerrar sesión?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tu sesión se cerrará y serás redirigido a la pantalla de login.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            {/* Botón Cancelar */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoggingOut}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Cancelar
            </button>

            {/* Botón Confirmar */}
            <button
              type="button"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cerrando sesión...
                </>
              ) : (
                'Cerrar sesión'
              )}
            </button>
          </div>

          {/* Hint para ESC */}
          {!isLoggingOut && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Presiona ESC para cancelar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;