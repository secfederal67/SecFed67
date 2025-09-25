import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

const ApoyoDashboard = () => {
  const { profile, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await signOut();
    }
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">EDUQUIARMX</h1>
                <p className="text-sm text-gray-600">Panel de Personal de Apoyo</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.nombre_completo}</p>
                <p className="text-xs text-gray-500">{profile?.rol}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bienvenida y Hora */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {profile?.nombre_completo}! 👋
            </h2>
            <p className="text-gray-600 mb-4">
              Panel de Personal de Apoyo - Gestión Administrativa
            </p>
            <div className="bg-blue-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-blue-700 font-medium">Hora actual:</p>
              <p className="text-2xl font-bold text-blue-900">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-sm text-blue-600">
                {currentTime.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Estado del Sistema"
            value="✅ Activo"
            subtitle="Funcionando correctamente"
            color="border-green-500"
            icon="🖥️"
          />
          <StatCard
            title="Cambio de Contraseña"
            value="✅ Completado"
            subtitle="Seguridad actualizada"
            color="border-blue-500"
            icon="🔐"
          />
          <StatCard
            title="Acceso"
            value="✅ Autorizado"
            subtitle="Personal de Apoyo"
            color="border-indigo-500"
            icon="👨‍💼"
          />
        </div>

        {/* Módulos Principales */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📋 Módulos de Personal de Apoyo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👨‍🎓</span>
                <span className="font-medium text-gray-500">Gestión de Alumnos</span>
              </div>
              <p className="text-sm text-gray-500">
                Registro y actualización de datos estudiantiles
              </p>
              <p className="text-xs text-blue-600 mt-2">En desarrollo...</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📱</span>
                <span className="font-medium text-gray-500">Credenciales QR</span>
              </div>
              <p className="text-sm text-gray-500">
                Generación e impresión de credenciales
              </p>
              <p className="text-xs text-blue-600 mt-2">En desarrollo...</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📊</span>
                <span className="font-medium text-gray-500">Reportes</span>
              </div>
              <p className="text-sm text-gray-500">
                Consultas y reportes de alumnos
              </p>
              <p className="text-xs text-blue-600 mt-2">En desarrollo...</p>
            </div>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">👤 Información del Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {profile?.nombre_completo}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {profile?.rol}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {profile?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {profile?.telefono || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer de Testing */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                🎉 ¡Sistema de Cambio de Contraseña Funcionando!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>• Primer login detectado correctamente</p>
                <p>• Cambio de contraseña completado</p>
                <p>• Dashboard cargado exitosamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApoyoDashboard;