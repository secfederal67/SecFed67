import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

const ChangePasswordModal = ({ onPasswordChanged }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  const { profile } = useAuth();

  // Validar contraseña en tiempo real
  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === formData.confirmPassword && password.length > 0
    };
    setValidations(validations);
    return Object.values(validations).every(v => v);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    // Validar en tiempo real cuando cambia la nueva contraseña
    if (name === 'newPassword') {
      validatePassword(value);
    }
    
    // Validar coincidencia cuando cambia la confirmación
    if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        match: value === formData.newPassword && value.length > 0
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsChanging(true);

    try {
      // Validaciones finales
      if (!formData.currentPassword) {
        throw new Error('La contraseña actual es obligatoria');
      }

      if (!validatePassword(formData.newPassword)) {
        throw new Error('La nueva contraseña no cumple con los requisitos');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.currentPassword === formData.newPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }

      // Llamar a la Edge Function
      const { data: sessionData } = await (await import('@/services/supabase/client')).supabase.auth.getSession();

      const response = await fetch('https://vakfeeczjthngwzcqkny.supabase.co/functions/v1/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al cambiar la contraseña');
      }

      // Éxito - notificar al componente padre
      onPasswordChanged();

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChanging(false);
    }
  };

  const PasswordField = ({ name, value, placeholder, label, showField }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showField ? "text" : "password"}
          name={name}
          value={value}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder={placeholder}
          disabled={isChanging}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(name === 'currentPassword' ? 'current' : name === 'newPassword' ? 'new' : 'confirm')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isChanging}
        >
          {showField ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.5 8.5m1.378 1.378L12 12m-3.122-3.122a3 3 0 013.122 3.122M15 12a3 3 0 01-3 3m0 0a3 3 0 01-3-3m3 3v.01M12 9v.01m-6.546-.054a9.97 9.97 0 011.563-3.029M21.543 12A10.05 10.05 0 0112 19" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cambiar Contraseña</h2>
          <p className="text-gray-600 mt-2">
            Hola <strong>{profile?.nombre_completo}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Debes cambiar tu contraseña temporal antes de continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña Actual */}
          <PasswordField
            name="currentPassword"
            value={formData.currentPassword}
            placeholder="Tu contraseña actual"
            label="Contraseña Actual"
            showField={showPasswords.current}
          />

          {/* Nueva Contraseña */}
          <PasswordField
            name="newPassword"
            value={formData.newPassword}
            placeholder="Tu nueva contraseña"
            label="Nueva Contraseña"
            showField={showPasswords.new}
          />

          {/* Indicadores de Validación */}
          {formData.newPassword && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center ${validations.length ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{validations.length ? '✅' : '❌'}</span>
                  Al menos 8 caracteres
                </div>
                <div className={`flex items-center ${validations.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{validations.uppercase ? '✅' : '❌'}</span>
                  Una letra mayúscula
                </div>
                <div className={`flex items-center ${validations.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{validations.lowercase ? '✅' : '❌'}</span>
                  Una letra minúscula
                </div>
                <div className={`flex items-center ${validations.number ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{validations.number ? '✅' : '❌'}</span>
                  Un número
                </div>
              </div>
            </div>
          )}

          {/* Confirmar Contraseña */}
          <PasswordField
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirma tu nueva contraseña"
            label="Confirmar Nueva Contraseña"
            showField={showPasswords.confirm}
          />

          {/* Indicador de Coincidencia */}
          {formData.confirmPassword && (
            <div className={`text-xs flex items-center ${validations.match ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{validations.match ? '✅' : '❌'}</span>
              Las contraseñas coinciden
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="ml-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={isChanging || !Object.values(validations).every(v => v)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isChanging ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cambiando contraseña...
              </>
            ) : (
              'Cambiar Contraseña'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Una vez cambiada tu contraseña, serás redirigido al login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;