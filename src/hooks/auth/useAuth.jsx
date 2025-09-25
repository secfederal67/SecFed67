import { useState, useEffect } from 'react';
import { authService } from '@/services/supabase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserProfile = async (userId) => {
    try {
      console.log('🔍 Cargando perfil para usuario:', userId);
      
      const { profile, error } = await authService.getUserProfile(userId);
      
      if (error) {
        console.error('❌ Error cargando perfil:', error);
        
        // Si es error 406, probablemente es problema de RLS
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
      
    } catch (err) {
      console.error('💥 Error inesperado cargando perfil:', err);
      setError('Error inesperado al cargar el perfil');
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...');
        
        // Verificar sesión actual
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
        }

      } catch (err) {
        console.error('💥 Error inicializando auth:', err);
        setError('Error inicializando la aplicación');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Escuchar cambios de autenticación
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
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
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
    signIn,
    signOut
  };
};