import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import ConfiguracionCT from './ConfiguracionCT';
import GestionPersonal from './GestionPersonal';

const DirectorDashboard = () => {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({
    totalAlumnos: 0,
    alumnosRiesgo: 0,
    maestrosActivos: 0,
    incidentesPendientes: 0
  });

  // Simulamos la carga de estadísticas (después conectaremos con Supabase)
  useEffect(() => {
    // TODO: Cargar estadísticas reales de la base de datos
    const loadStats = async () => {
      // Simular carga
      setTimeout(() => {
        setStats({
          totalAlumnos: 245,
          alumnosRiesgo: 12,
          maestrosActivos: 18,
          incidentesPendientes: 3
        });
      }, 1000);
    };

    loadStats();
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
      description: 'Vista general del centro educativo'
    },
    {
      id: 'configuracion-ct',
      name: 'Configuración CT',
      icon: '🏫',
      description: 'Información del Centro de Trabajo'
    },
    {
      id: 'personal',
      name: 'Gestión de Personal',
      icon: '👥',
      description: 'Administrar cuentas de usuario'
    },
    {
      id: 'carga-academica',
      name: 'Carga Académica',
      icon: '📚',
      description: 'Revisar y aprobar estructura académica'
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: '📈',
      description: 'Estadísticas y reportes del sistema'
    },
    {
      id: 'fin-ciclo',
      name: 'Fin de Ciclo',
      icon: '🎓',
      description: 'Proceso de cierre y promoción'
    }
  ];

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

  const renderContent = () => {
    if (currentView === 'configuracion-ct') {
      return <ConfiguracionCT />;
    }

    if (currentView === 'personal') {
      return <GestionPersonal />;
    }

    // Vista principal del dashboard
    return (
      <div className="space-y-6">
        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Alumnos"
            value={stats.totalAlumnos}
            subtitle="Ciclo actual"
            color="border-blue-500"
            icon="👨‍🎓"
          />
          <StatCard
            title="Alumnos en Riesgo"
            value={stats.alumnosRiesgo}
            subtitle="Semáforo rojo/amarillo"
            color="border-red-500"
            icon="⚠️"
          />
          <StatCard
            title="Maestros Activos"
            value={stats.maestrosActivos}
            subtitle="Personal docente"
            color="border-green-500"
            icon="👩‍🏫"
          />
          <StatCard
            title="Incidentes Pendientes"
            value={stats.incidentesPendientes}
            subtitle="Requieren atención"
            color="border-orange-500"
            icon="📋"
          />
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🚀 Accesos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentView('configuracion-ct')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🏫</span>
                <span className="font-medium">Configurar CT</span>
              </div>
              <p className="text-sm text-gray-600">
                Establecer información del centro de trabajo
              </p>
            </button>

            <button
              onClick={() => setCurrentView('personal')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👥</span>
                <span className="font-medium">Crear Personal</span>
              </div>
              <p className="text-sm text-gray-600">
                Dar de alta maestros y personal administrativo
              </p>
            </button>

            <div className="p-4 text-left border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📚</span>
                <span className="font-medium text-gray-500">Carga Académica</span>
              </div>
              <p className="text-sm text-gray-500">
                Disponible cuando se configure el personal
              </p>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📰 Actividad Reciente</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800">Sistema iniciado correctamente</p>
                <p className="text-xs text-green-600">Hace 2 minutos</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">i</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-blue-800">Configura tu Centro de Trabajo</p>
                <p className="text-xs text-blue-600">Pendiente</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-yellow-800">Crear cuentas de personal</p>
                <p className="text-xs text-yellow-600">Siguiente paso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">EDUQUIARMX</h1>
                <p className="text-sm text-gray-600">Panel de Director</p>
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
              <h2 className="font-semibold text-gray-900 mb-4">📋 Módulos</h2>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentView === item.id
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {currentView === item.id && (
                          <p className="text-xs text-indigo-600 mt-1">{item.description}</p>
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

export default DirectorDashboard;