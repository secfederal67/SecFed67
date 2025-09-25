import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/services/supabase/client';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

const GestionPersonal = () => {
  const { profile } = useAuth();
  const [personal, setPersonal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Formulario para nuevo usuario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    rol: 'Maestro',
    email: '',
    telefono: '',
    direccion: '',
    password: ''
  });

  const roles = [
    { value: 'Subdirector', label: 'Subdirector', icon: '👔' },
    { value: 'Trabajo Social', label: 'Trabajo Social', icon: '🤝' },
    { value: 'Maestro', label: 'Maestro', icon: '👩‍🏫' },
    { value: 'Apoyo', label: 'Personal de Apoyo', icon: '📋' },
    { value: 'Acceso', label: 'Personal de Acceso', icon: '🚪' }
  ];

  // Cargar lista de personal
  useEffect(() => {
    loadPersonal();
  }, []);

  const loadPersonal = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre_completo, rol, email, telefono, direccion')
        .neq('rol', 'Director')
        .order('nombre_completo');

      if (error) throw error;
      setPersonal(data || []);
    } catch (error) {
      console.error('Error cargando personal:', error);
      showMessage('error', 'Error al cargar la lista de personal');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Validaciones básicas
      if (!formData.nombre_completo.trim() || !formData.email.trim()) {
        throw new Error('Nombre completo y email son obligatorios');
      }

      if (!editingUser && !formData.password) {
        throw new Error('Debe generar una contraseña');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Formato de email inválido');
      }

      if (editingUser) {
        // Actualizar usuario existente (solo perfil)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            nombre_completo: formData.nombre_completo,
            rol: formData.rol,
            email: formData.email,
            telefono: formData.telefono,
            direccion: formData.direccion
          })
          .eq('id', editingUser.id);

        if (updateError) throw updateError;
        showMessage('success', 'Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario usando Edge Function
        const { data: sessionData } = await supabase.auth.getSession();
        
        const response = await fetch('https://vakfeeczjthngwzcqkny.supabase.co/functions/v1/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            nombre_completo: formData.nombre_completo,
            rol: formData.rol,
            telefono: formData.telefono,
            direccion: formData.direccion
          })
        });

        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Error al crear usuario');
        }

        showMessage('success', `Usuario creado correctamente. Contraseña: ${formData.password}`);
      }

      // Resetear formulario y cerrar modal
      setFormData({
        nombre_completo: '',
        rol: 'Maestro',
        email: '',
        telefono: '',
        direccion: '',
        password: ''
      });
      setEditingUser(null);
      setShowModal(false);
      
      // Recargar lista
      await loadPersonal();

    } catch (error) {
      console.error('Error creando/actualizando usuario:', error);
      showMessage('error', error.message || 'Error al procesar la solicitud');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre_completo: user.nombre_completo,
      rol: user.rol,
      email: user.email,
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    console.log('🔧 handleDelete ejecutado', user); // AGREGAR ESTO
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (user) => {
    setIsDeleting(true);

    try {
      // Llamar a la Edge Function para eliminar usuario
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch('https://vakfeeczjthngwzcqkny.supabase.co/functions/v1/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      showMessage('success', `Usuario ${user.nombre_completo} eliminado correctamente`);
      
      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Recargar lista
      await loadPersonal();

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      showMessage('error', error.message || 'Error al eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nombre_completo: '',
      rol: 'Maestro',
      email: '',
      telefono: '',
      direccion: '',
      password: ''
    });
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando personal...</p>
          {/* Modal de Eliminación */}
      {showDeleteModal && userToDelete && (
        <DeleteConfirmationModal
          user={userToDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
              <p className="text-gray-600 mt-1">
                Administra las cuentas de usuarios del sistema
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-2">👤</span>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Personal */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Personal Registrado ({personal.length})</h2>
        </div>
        
        {personal.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2m16 0H4m16 0v-1a3 3 0 00-3-3h-1m-2 3h4m0-3h1a3 3 0 001-1V9a3 3 0 00-1-1h-4a3 3 0 00-1 1v2a3 3 0 001 1h4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay personal registrado</h3>
            <p className="text-gray-500">Comienza creando las cuentas de tu equipo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personal.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {roles.find(r => r.value === user.rol)?.icon} {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.telefono || 'Sin teléfono'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.icon} {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {!editingUser && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña Temporal *
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Genera una contraseña automática"
                        />
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                        >
                          Generar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        El usuario deberá cambiar esta contraseña en su primer acceso
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingUser ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      editingUser ? 'Actualizar' : 'Crear Usuario'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPersonal;