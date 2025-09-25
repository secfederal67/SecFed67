import { useState } from 'react';

const DeleteConfirmationModal = ({ user, onConfirm, onCancel, isDeleting }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationType, setConfirmationType] = useState('email'); // 'email' or 'name'
  
  const expectedEmail = user.email.toLowerCase();
  const expectedName = user.nombre_completo.toLowerCase();
  const userInput = confirmationText.toLowerCase().trim();
  
  const isValidConfirmation = confirmationType === 'email' 
    ? userInput === expectedEmail
    : userInput === expectedName;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidConfirmation && !isDeleting) {
      onConfirm(user);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header de Advertencia */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Eliminar Usuario</h2>
          <p className="text-red-600 mt-2 font-medium">
            Esta acción NO se puede deshacer
          </p>
        </div>

        {/* Información del Usuario */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Usuario a eliminar:</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Nombre:</span> {user.nombre_completo}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Rol:</span> {user.rol}</p>
          </div>
        </div>

        {/* Advertencias */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Consecuencias de esta acción:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>El usuario no podrá acceder al sistema</li>
                  <li>Se eliminará de Supabase Auth permanentemente</li>
                  <li>Su perfil se borrará de la base de datos</li>
                  <li>Esta acción es irreversible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Confirmación */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Confirmación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={confirmationType === 'email'}
                  onChange={(e) => {
                    setConfirmationType(e.target.value);
                    setConfirmationText('');
                  }}
                  className="mr-2 text-red-600 focus:ring-red-500"
                  disabled={isDeleting}
                />
                <span className="text-sm">El email del usuario: <code className="bg-gray-100 px-1 rounded text-xs">{user.email}</code></span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="name"
                  checked={confirmationType === 'name'}
                  onChange={(e) => {
                    setConfirmationType(e.target.value);
                    setConfirmationText('');
                  }}
                  className="mr-2 text-red-600 focus:ring-red-500"
                  disabled={isDeleting}
                />
                <span className="text-sm">El nombre completo: <code className="bg-gray-100 px-1 rounded text-xs">{user.nombre_completo}</code></span>
              </label>
            </div>
          </div>

          {/* Campo de Confirmación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {confirmationType === 'email' ? 'Email del usuario:' : 'Nombre completo del usuario:'}
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={confirmationType === 'email' ? 'Escribe el email exactamente...' : 'Escribe el nombre exactamente...'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                confirmationText && isValidConfirmation
                  ? 'border-green-300 focus:ring-green-500'
                  : confirmationText
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-gray-500'
              }`}
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmationText && !isValidConfirmation && (
              <p className="mt-1 text-xs text-red-600">
                No coincide. {confirmationType === 'email' ? 'Email' : 'Nombre'} debe ser exacto.
              </p>
            )}
            {confirmationText && isValidConfirmation && (
              <p className="mt-1 text-xs text-green-600">
                Confirmación correcta
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValidConfirmation || isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                'Eliminar Usuario'
              )}
            </button>
          </div>
        </form>

        {/* Instrucción adicional */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Debes escribir {confirmationType === 'email' ? 'el email' : 'el nombre'} exactamente como aparece arriba
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;