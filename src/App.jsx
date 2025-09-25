import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import Login from '@/pages/auth/Login';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';

// Importaciones de páginas por rol
import DirectorDashboard from '@/pages/director/Dashboard';
import ApoyoDashboard from '@/pages/apoyo/Dashboard';
// import SubdirectorDashboard from '@/pages/subdirector/Dashboard';
// import MaestroDashboard from '@/pages/maestro/Dashboard';
// import TrabajosocialDashboard from '@/pages/trabajosocial/Dashboard';
// import AccesoEscaneo from '@/pages/acceso/EscaneoQR';

// Componente temporal para mostrar dashboard básico
const TemporaryDashboard = ({ role }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="mb-6">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
        <p className="text-gray-600 mt-2">Sesión iniciada correctamente</p>
      </div>
      
      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900">Tu rol:</p>
          <p className="text-lg font-bold text-blue-700">{role}</p>
        </div>
        
        <p className="text-sm text-gray-500">
          Dashboard específico en desarrollo...
        </p>
      </div>
    </div>
  </div>
);

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para redirigir según el rol del usuario
const DashboardRouter = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Por ahora usamos dashboards reales para Director, temporales para otros roles
  switch (profile.rol) {
    case 'Director':
      return <DirectorDashboard />;
    
    case 'Subdirector':
      return <TemporaryDashboard role="Subdirector" />;
      // return <SubdirectorDashboard />;
    
    case 'Maestro':
      return <TemporaryDashboard role="Maestro" />;
      // return <MaestroDashboard />;
    
    case 'Trabajo Social':
      return <TemporaryDashboard role="Trabajo Social" />;
      // return <TrabajosocialDashboard />;
    
    case 'Apoyo':
      return <ApoyoDashboard />;
    
    case 'Acceso':
      return <TemporaryDashboard role="Acceso" />;
      // return <AccesoEscaneo />;
    
    default:
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Rol no reconocido</h2>
              <p className="text-gray-600 mt-2">Contacta al administrador del sistema</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-700">
                Rol actual: <strong>{profile.rol || 'Sin definir'}</strong>
              </p>
            </div>
          </div>
        </div>
      );
  }
};

function App() {
  const { showPasswordModal, handlePasswordChanged } = useAuth();

  return (
    <Router>
      <div className="App">
        {/* Modal de Cambio de Contraseña (se muestra sobre todo) */}
        {showPasswordModal && (
          <ChangePasswordModal onPasswordChanged={handlePasswordChanged} />
        )}

        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto - redirige al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Captura todas las demás rutas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;