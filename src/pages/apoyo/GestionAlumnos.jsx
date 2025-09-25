import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/services/supabase/client';

const GestionAlumnos = () => {
  const { profile } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Datos necesarios para inscripciones
  const [cicloActivo, setCicloActivo] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [turnos, setTurnos] = useState([]);

  // Formulario para nuevo alumno
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    curp: '',
    tutor_nombre: '',
    tutor_email: '',
    tutor_telefono: '',
    grupo_id: '',
    foto_url: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadAlumnos(),
        loadCicloActivo(),
        loadCatalogos()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showMessage('error', 'Error al cargar los datos del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlumnos = async () => {
    try {
      // Obtener alumnos con su inscripción actual usando la vista
      const { data, error } = await supabase
        .from('expediente_alumno')
        .select('*')
        .eq('estatus_inscripcion', 'Activo')
        .order('apellido_paterno', { ascending: true });

      if (error) throw error;
      setAlumnos(data || []);
    } catch (error) {
      console.error('Error cargando alumnos:', error);
      throw error;
    }
  };

  const loadCicloActivo = async () => {
    try {
      const { data, error } = await supabase
        .from('ciclos_escolares')
        .select('*')
        .eq('estatus', 'Activo')
        .single();

      if (error) throw error;
      setCicloActivo(data);
    } catch (error) {
      console.error('Error cargando ciclo activo:', error);
      throw error;
    }
  };

  const loadCatalogos = async () => {
    try {
      // Cargar turnos, grados y grupos
      const [turnosRes, gradosRes, gruposRes] = await Promise.all([
        supabase.from('turnos').select('*').order('nombre'),
        supabase.from('grados').select('*').order('nombre'),
        supabase
          .from('grupos')
          .select(`
            id, 
            nombre,
            grados (id, nombre),
            turnos (id, nombre)
          `)
          .order('nombre')
      ]);

      if (turnosRes.error) throw turnosRes.error;
      if (gradosRes.error) throw gradosRes.error;
      if (gruposRes.error) throw gruposRes.error;

      setTurnos(turnosRes.data || []);
      setGrados(gradosRes.data || []);
      setGrupos(gruposRes.data || []);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      throw error;
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formateo automático para CURP
    if (name === 'curp') {
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // Formateo para nombres (primera letra mayúscula)
    if (['nombres', 'apellido_paterno', 'apellido_materno', 'tutor_nombre'].includes(name)) {
      const formattedValue = value.replace(/\b\w/g, letter => letter.toUpperCase());
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateCURP = (curp) => {
    // Validación básica de CURP (18 caracteres)
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    return curpRegex.test(curp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Validaciones básicas
      if (!formData.nombres.trim() || !formData.apellido_paterno.trim()) {
        throw new Error('Nombres y apellido paterno son obligatorios');
      }

      if (!formData.grupo_id) {
        throw new Error('Debe seleccionar un grupo');
      }

      if (!cicloActivo) {
        throw new Error('No hay un ciclo escolar activo');
      }

      // Validar CURP si se proporcionó
      if (formData.curp && !validateCURP(formData.curp)) {
        throw new Error('El formato de CURP no es válido');
      }

      // Validar email del tutor si se proporcionó
      if (formData.tutor_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.tutor_email)) {
          throw new Error('El formato del email del tutor no es válido');
        }
      }

      if (editingAlumno) {
        // Actualizar alumno existente
        const { error: updateAlumnoError } = await supabase
          .from('alumnos')
          .update({
            nombres: formData.nombres,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            curp: formData.curp || null,
            tutor_nombre: formData.tutor_nombre || null,
            tutor_email: formData.tutor_email || null,
            tutor_telefono: formData.tutor_telefono || null,
            foto_url: formData.foto_url || null
          })
          .eq('id', editingAlumno.alumno_id);

        if (updateAlumnoError) throw updateAlumnoError;

        // Actualizar inscripción si cambió el grupo
        if (formData.grupo_id !== editingAlumno.grupo_id) {
          const { error: updateInscripcionError } = await supabase
            .from('inscripciones')
            .update({
              grupo_id: formData.grupo_id
            })
            .eq('alumno_id', editingAlumno.alumno_id)
            .eq('ciclo_escolar_id', cicloActivo.id);

          if (updateInscripcionError) throw updateInscripcionError;
        }

        showMessage('success', 'Alumno actualizado correctamente');
      } else {
        // Crear nuevo alumno
        const { data: alumnoData, error: alumnoError } = await supabase
          .from('alumnos')
          .insert({
            nombres: formData.nombres,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            curp: formData.curp || null,
            tutor_nombre: formData.tutor_nombre || null,
            tutor_email: formData.tutor_email || null,
            tutor_telefono: formData.tutor_telefono || null,
            foto_url: formData.foto_url || null
          })
          .select()
          .single();

        if (alumnoError) throw alumnoError;

        // Crear inscripción en el ciclo activo
        const { error: inscripcionError } = await supabase
          .from('inscripciones')
          .insert({
            alumno_id: alumnoData.id,
            grupo_id: formData.grupo_id,
            ciclo_escolar_id: cicloActivo.id,
            estatus: 'Activo'
          });

        if (inscripcionError) throw inscripcionError;

        showMessage('success', 'Alumno registrado correctamente');
      }

      // Resetear formulario y cerrar modal
      resetForm();
      setShowCreateModal(false);
      
      // Recargar lista
      await loadAlumnos();

    } catch (error) {
      console.error('Error guardando alumno:', error);
      showMessage('error', error.message || 'Error al guardar el alumno');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      curp: '',
      tutor_nombre: '',
      tutor_email: '',
      tutor_telefono: '',
      grupo_id: '',
      foto_url: ''
    });
    setEditingAlumno(null);
  };

  const handleEdit = (alumno) => {
    setEditingAlumno(alumno);
    setFormData({
      nombres: alumno.nombres || '',
      apellido_paterno: alumno.apellido_paterno || '',
      apellido_materno: alumno.apellido_materno || '',
      curp: alumno.curp || '',
      tutor_nombre: alumno.tutor_nombre || '',
      tutor_email: alumno.tutor_email || '',
      tutor_telefono: alumno.tutor_telefono || '',
      grupo_id: alumno.grupo_id || '',
      foto_url: alumno.foto_url || ''
    });
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const getGrupoDisplay = (grupo) => {
    const grupoData = grupos.find(g => g.id === grupo?.id);
    if (grupoData) {
      return `${grupoData.grados?.nombre} "${grupoData.nombre}" - ${grupoData.turnos?.nombre}`;
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
              <p className="text-gray-600 mt-1">
                Registro y administración de estudiantes - {cicloActivo?.nombre}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-2">👨‍🎓</span>
              Nuevo Alumno
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

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alumnos</p>
              <p className="text-3xl font-bold text-gray-900">{alumnos.length}</p>
              <p className="text-sm text-gray-500 mt-1">Ciclo {cicloActivo?.nombre}</p>
            </div>
            <div className="text-4xl">👨‍🎓</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grupos Activos</p>
              <p className="text-3xl font-bold text-gray-900">{grupos.length}</p>
              <p className="text-sm text-gray-500 mt-1">Disponibles</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grados</p>
              <p className="text-3xl font-bold text-gray-900">{grados.length}</p>
              <p className="text-sm text-gray-500 mt-1">Niveles</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turnos</p>
              <p className="text-3xl font-bold text-gray-900">{turnos.length}</p>
              <p className="text-sm text-gray-500 mt-1">Disponibles</p>
            </div>
            <div className="text-4xl">🕐</div>
          </div>
        </div>
      </div>

      {/* Lista de Alumnos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Alumnos Registrados ({alumnos.length})</h2>
        </div>
        
        {alumnos.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alumnos registrados</h3>
            <p className="text-gray-500">Comienza registrando el primer estudiante</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CURP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumnos.map((alumno) => (
                  <tr key={alumno.alumno_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alumno.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-500">ID: {alumno.alumno_id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alumno.curp || 'No registrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {alumno.grado} "{alumno.grupo}" - {alumno.turno}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{alumno.tutor_nombre || 'No registrado'}</div>
                        {alumno.tutor_email && (
                          <div className="text-xs text-gray-400">{alumno.tutor_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(alumno)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {/* TODO: Generar credencial QR */}}
                        className="text-green-600 hover:text-green-900"
                      >
                        Credencial
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAlumno ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Datos Personales */}
                  <div className="md:col-span-3">
                    <h4 className="text-md font-medium text-gray-800 mb-3">📋 Datos Personales</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre(s) *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido Paterno *
                    </label>
                    <input
                      type="text"
                      name="apellido_paterno"
                      value={formData.apellido_paterno}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      name="apellido_materno"
                      value={formData.apellido_materno}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CURP
                    </label>
                    <input
                      type="text"
                      name="curp"
                      value={formData.curp}
                      onChange={handleInputChange}
                      maxLength="18"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="AAAA######HMCRRR##"
                    />
                    {formData.curp && !validateCURP(formData.curp) && (
                      <p className="mt-1 text-xs text-red-600">Formato de CURP inválido</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grupo *
                    </label>
                    <select
                      name="grupo_id"
                      value={formData.grupo_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar grupo</option>
                      {grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>
                          {grupo.grados?.nombre} "{grupo.nombre}" - {grupo.turnos?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Datos del Tutor */}
                  <div className="md:col-span-3 mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">👨‍👩‍👧‍👦 Datos del Tutor</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Tutor
                    </label>
                    <input
                      type="text"
                      name="tutor_nombre"
                      value={formData.tutor_nombre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email del Tutor
                    </label>
                    <input
                      type="email"
                      name="tutor_email"
                      value={formData.tutor_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="tutor@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono del Tutor
                    </label>
                    <input
                      type="tel"
                      name="tutor_telefono"
                      value={formData.tutor_telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="33-1234-5678"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                        {editingAlumno ? 'Actualizando...' : 'Registrando...'}
                      </>
                    ) : (
                      editingAlumno ? 'Actualizar Alumno' : 'Registrar Alumno'
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

export default GestionAlumnos;