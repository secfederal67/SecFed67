import { useState, useEffect } from 'react';
import { authService } from '@/services/supabase/auth';
import { supabase } from '@/services/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadUserProfile = async (userId) => {
    try {
      console.log('🔍 Cargando perfil para usuario:', userId);
      
      const { profile, error } = await authService.getUserProfile(userId);
      
      if (error) {
        console.error('❌ Error cargando perfil:', error);
        
        if (error.message?.includes('406') || error.code === 'PGRST116') {
          setError('Error de permisos al cargar el perfil. Contacta al administrador.');
          console.warn('💡 Posible problema de RLS en tabla profiles');
        } else {
          setError('Error al cargar el perfil del usuario');
        }
        
        setProfile(null);
        return;
      }

      if (!profile) {
        console.warn('⚠️ No se encontró perfil para el usuario');
        setError('No se encontró perfil para este usuario');
        setProfile(null);
        return;
      }

      console.log('✅ Perfil cargado:', profile);
      setProfile(profile);
      setError(null);

      // *** NUEVA LÓGICA: Verificar si requiere cambio de contraseña ***
      if (profile.requires_password_change === true) {
        console.log('🔒 Usuario requiere cambio de contraseña');
        setRequiresPasswordChange(true);
        setShowPasswordModal(true);
      } else {
        console.log('🟢 Usuario no requiere cambio de contraseña');
        setRequiresPasswordChange(false);
        setShowPasswordModal(false);
      }
      
    } catch (err) {
      console.error('💥 Error inesperado cargando perfil:', err);
      setError('Error inesperado al cargar el perfil');
      setProfile(null);
    }
  };

  // *** NUEVA FUNCIÓN: Manejar cuando se cambió la contraseña ***
  const handlePasswordChanged = async () => {
    console.log('🔄 Contraseña cambiada, cerrando sesión...');
    
    try {
      // Cerrar modal inmediatamente
      setShowPasswordModal(false);
      setRequiresPasswordChange(false);
      
      // Limpiar estado local primero
      setUser(null);
      setProfile(null);
      setError(null);
      
      // Intentar logout, pero no fallar si ya se invalidó la sesión
      try {
        await authService.signOut();
        console.log('✅ Logout normal exitoso');
      } catch (logoutError) {
        console.log('⚠️ Sesión ya invalidada por cambio de contraseña:', logoutError);
        // No es un error real, Supabase invalidó la sesión automáticamente
      }
      
      // Limpiar cualquier dato persistente de Supabase
      await supabase.auth.signOut();
      
      // Mensaje de éxito
      alert('¡Contraseña cambiada exitosamente! Serás redirigido al login.');
      
      // Forzar redirect al login usando window.location (más confiable)
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      console.error('Error durante logout después de cambio de contraseña:', error);
      // Fallback: Forzar recarga completa de página
      alert('Contraseña cambiada. Recargando página...');
      window.location.reload();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...');
        
        const { user: currentUser, error: userError } = await authService.getCurrentUser();
        
        if (userError) {
          console.error('❌ Error obteniendo usuario actual:', userError);
          setError('Error de autenticación');
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        if (currentUser) {
          console.log('👤 Usuario autenticado:', currentUser.email);
          await loadUserProfile(currentUser.id);
        } else {
          console.log('👤 No hay usuario autenticado');
          setProfile(null);
          setRequiresPasswordChange(false);
          setShowPasswordModal(false);
        }

      } catch (err) {
        console.error('💥 Error inicializando auth:', err);
        setError('Error inicializando la aplicación');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de autenticación:', event);
        
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          console.log('👤 Usuario logueado:', currentUser.email);
          setLoading(true);
          await loadUserProfile(currentUser.id);
          setLoading(false);
        } else {
          console.log('👤 Usuario deslogueado');
          setProfile(null);
          setError(null);
          setRequiresPasswordChange(false);
          setShowPasswordModal(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await authService.signIn(email, password);
      
      if (result.error) {
        setError('Credenciales inválidas');
        return { error: result.error };
      }

      // El perfil se cargará automáticamente por el listener onAuthStateChange
      return { error: null };
      
    } catch (err) {
      setError('Error de conexión');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar estado local inmediatamente
      setUser(null);
      setProfile(null);
      setError(null);
      setRequiresPasswordChange(false);
      setShowPasswordModal(false);
      
      // Intentar logout en Supabase
      await authService.signOut();
      console.log('✅ Logout exitoso');
      
      // Forzar redirect al login
      setTimeout(() => {
        window.location.href = '/login';
      }, 100); // Pequeño delay para que se procese el estado
      
    } catch (err) {
      console.error('Error signing out:', err);
      
      // Aún así, forzar el redirect porque el estado local ya se limpió
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    role: profile?.rol,
    requiresPasswordChange,
    showPasswordModal,
    signIn,
    signOut,
    handlePasswordChanged
  };
};