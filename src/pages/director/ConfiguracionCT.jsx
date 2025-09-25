import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { databaseService } from '@/services/supabase/database';

const ConfiguracionCT = () => {
  const { profile } = useAuth();
  const [ctInfo, setCTInfo] = useState({
    nombre_oficial: '',
    clave_ct: '',
    direccion: '',
    municipio: '',
    codigo_postal: '',
    rfc: '',
    telefono: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar información actual del CT
  useEffect(() => {
    const loadCTInfo = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await databaseService.select('ct_info');
        
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setCTInfo(data[0]);
          // Si ya hay información, no activar modo edición automáticamente
          setIsEditing(false);
        } else {
          // Si no hay información, activar modo edición para configuración inicial
          setIsEditing(true);
          setMessage({
            type: 'info',
            text: 'Configura la información básica de tu Centro de Trabajo'
          });
        }
      } catch (error) {
        console.error('Error cargando información del CT:', error);
        setMessage({
          type: 'error',
          text: 'Error al cargar la información del Centro de Trabajo'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCTInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCTInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Validaciones básicas
      if (!ctInfo.nombre_oficial.trim() || !ctInfo.clave_ct.trim()) {
        throw new Error('El nombre oficial y la clave del CT son obligatorios');
      }

      let result;
      if (ctInfo.id) {
        // Actualizar información existente
        result = await databaseService.update('ct_info', ctInfo.id, ctInfo);
      } else {
        // Crear nueva información
        result = await databaseService.insert('ct_info', ctInfo);
      }

      if (result.error) {
        throw result.error;
      }

      // Actualizar el estado local con los datos guardados
      if (result.data && result.data.length > 0) {
        setCTInfo(result.data[0]);
      }

      setMessage({
        type: 'success',
        text: 'Información del Centro de Trabajo guardada correctamente'
      });
      
      setIsEditing(false);

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('Error guardando información:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al guardar la información'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Recargar la página para restaurar los datos originales
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del Centro de Trabajo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configuración del Centro de Trabajo
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona la información oficial de tu escuela
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  ✏️ Editar
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>💾 Guardar</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' && (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {message.type === 'error' && (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {message.type === 'info' && (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSave} className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Oficial */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Oficial de la Escuela <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_oficial"
                value={ctInfo.nombre_oficial}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Ej: Escuela Secundaria Federal No. 123"
                required
              />
            </div>

            {/* Clave CT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave del Centro de Trabajo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clave_ct"
                value={ctInfo.clave_ct}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Ej: 14DES0123X"
                required
              />
            </div>

            {/* RFC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFC de la Institución
              </label>
              <input
                type="text"
                name="rfc"
                value={ctInfo.rfc}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Ej: ESF123456ABC"
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={ctInfo.direccion}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Calle, número, colonia"
              />
            </div>

            {/* Municipio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio
              </label>
              <input
                type="text"
                name="municipio"
                value={ctInfo.municipio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Ej: Guadalajara"
              />
            </div>

            {/* Código Postal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="codigo_postal"
                value={ctInfo.codigo_postal}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Ej: 44100"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={ctInfo.telefono}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                placeholder="Ej: 33-1234-5678"
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">ℹ️ Información Importante</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• La <strong>Clave del CT</strong> es proporcionada por la SEP/SEJ</li>
              <li>• Esta información aparecerá en reportes oficiales y documentos</li>
              <li>• Solo tú como Director puedes modificar estos datos</li>
              <li>• Los campos marcados con <span className="text-red-500">*</span> son obligatorios</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracionCT;