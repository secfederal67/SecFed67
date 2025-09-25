import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import GestionAlumnos from './GestionAlumnos';

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState('dashboard');

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

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Panel Principal',
      icon: '📊',
      description: 'Vista general'
    },
    {
      id: 'alumnos',
      name: 'Gestión de Alumnos',
      icon: '👨‍🎓',
      description: 'Registrar y administrar estudiantes'
    },
    {
      id: 'credenciales',
      name: 'Credenciales QR',
      icon: '📱',
      description: 'Generar credenciales de acceso'
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'alumnos':
        return <GestionAlumnos />;
      
      case 'credenciales':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Credenciales QR</h2>
            <p className="text-gray-600 mb-4">
              Módulo para generar e imprimir credenciales QR de los alumnos.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">Próximamente...</p>
            </div>
          </div>
        );
      
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Bienvenida */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido, {profile?.nombre_completo}
          </h2>
          <p className="text-gray-600 mb-4">
            Panel de Personal de Apoyo
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

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Módulos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentView('alumnos')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">👨‍🎓</span>
              <span className="font-medium">Gestión de Alumnos</span>
            </div>
            <p className="text-sm text-gray-500">
              Registrar y actualizar datos estudiantiles
            </p>
          </button>

          <button
            onClick={() => setCurrentView('credenciales')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📱</span>
              <span className="font-medium">Credenciales QR</span>
            </div>
            <p className="text-sm text-gray-500">
              Generar e imprimir credenciales
            </p>
          </button>
        </div>
      </div>

      {/* Información del Usuario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Información Personal</h2>
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
    </>
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
                <p className="text-sm text-gray-600">Personal de Apoyo</p>
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Navegación */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Módulos</h2>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentView === item.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {currentView === item.id && (
                          <p className="text-xs text-green-600 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;