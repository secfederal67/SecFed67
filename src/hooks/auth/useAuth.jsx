import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@/services/supabase/auth';
import { supabase } from '@/services/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Referencias para evitar re-renders y llamadas duplicadas
  const initializingRef = useRef(false);
  const profileLoadedRef = useRef(false);
  const subscriptionRef = useRef(null);

  // Función optimizada para cargar perfil (con useCallback para evitar re-creación)
  const loadUserProfile = useCallback(async (userId, isInitialLoad = false) => {
    // Evitar cargas duplicadas del mismo usuario
    if (profileLoadedRef.current === userId) {
      console.log('🔧 Perfil ya cargado para usuario:', userId);
      return;
    }

    try {
      console.log('🔍 Cargando perfil para usuario:', userId, isInitialLoad ? '(inicial)' : '(actualización)');
      
      const { profile, error } = await authService.getUserProfile(userId);
      
      if (error) {
        console.error('❌ Error cargando perfil:', error.message);
        setError('Error al cargar el perfil del usuario');
        setProfile(null);
        profileLoadedRef.current = null;
        return;
      }

      if (!profile) {
        console.warn('⚠️ No se encontró perfil para el usuario');
        setError('No se encontró perfil para este usuario');
        setProfile(null);
        profileLoadedRef.current = null;
        return;
      }

      console.log('✅ Perfil cargado:', profile.nombre_completo, `(${profile.rol})`);
      setProfile(profile);
      setError(null);
      profileLoadedRef.current = userId;

      // Verificar cambio de contraseña solo en carga inicial o cuando cambia el usuario
      if (isInitialLoad || !profileLoadedRef.current) {
        const needsPasswordChange = profile.requires_password_change === true;
        console.log(needsPasswordChange ? '🔒 Usuario requiere cambio de contraseña' : '🟢 Contraseña OK');
        
        setRequiresPasswordChange(needsPasswordChange);
        setShowPasswordModal(needsPasswordChange);
      }
      
    } catch (err) {
      console.error('💥 Error inesperado cargando perfil:', err);
      setError('Error inesperado al cargar el perfil');
      setProfile(null);
      profileLoadedRef.current = null;
    }
  }, []);

  // Función optimizada para manejar cambio de contraseña
  const handlePasswordChanged = useCallback(async () => {
    console.log('🔄 Contraseña cambiada, procesando logout...');
    
    try {
      // Limpiar estados inmediatamente
      setShowPasswordModal(false);
      setRequiresPasswordChange(false);
      setUser(null);
      setProfile(null);
      setError(null);
      
      // Limpiar referencias
      profileLoadedRef.current = null;
      initializingRef.current = false;

      // Limpiar suscripción existente
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Logout silencioso (puede fallar si la sesión ya se invalidó)
      try {
        await authService.signOut();
      } catch (logoutError) {
        console.log('⚠️ Logout falló (sesión ya invalidada):', logoutError.message);
      }
      
      // Logout adicional directo en Supabase
      await supabase.auth.signOut();
      
      // Mensaje y redirect
      alert('Contraseña cambiada exitosamente. Redirigiendo al login...');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      console.error('Error en handlePasswordChanged:', error);
      window.location.reload();
    }
  }, []);

  // Función optimizada de signOut
  const signOut = useCallback(async () => {
    console.log('🚪 Cerrando sesión...');
    setLoading(true);
    
    try {
      // Limpiar estado local inmediatamente
      setUser(null);
      setProfile(null);
      setError(null);
      setRequiresPasswordChange(false);
      setShowPasswordModal(false);
      
      // Limpiar referencias
      profileLoadedRef.current = null;
      initializingRef.current = false;
      
      // Limpiar suscripción
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Logout
      await authService.signOut();
      console.log('✅ Logout exitoso');
      
    } catch (err) {
      console.error('Error en signOut:', err);
    } finally {
      setLoading(false);
      // Redirect forzado
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, []);

  // Función optimizada de signIn
  const signIn = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await authService.signIn(email, password);
      
      if (result.error) {
        setError('Credenciales inválidas');
        return { error: result.error };
      }

      // No establecer loading aquí, el listener se encargará
      return { error: null };
      
    } catch (err) {
      setError('Error de conexión');
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto principal de inicialización
  useEffect(() => {
    // Evitar inicializaciones múltiples
    if (initializingRef.current) {
      console.log('🔧 Inicialización ya en progreso, omitiendo...');
      return;
    }

    const initAuth = async () => {
      if (initializingRef.current) return;
      
      initializingRef.current = true;
      console.log('🚀 Inicializando autenticación...');
      
      try {
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
          await loadUserProfile(currentUser.id, true);
        } else {
          console.log('👤 No hay usuario autenticado');
          setProfile(null);
          setRequiresPasswordChange(false);
          setShowPasswordModal(false);
          profileLoadedRef.current = null;
        }

      } catch (err) {
        console.error('💥 Error inicializando auth:', err);
        setError('Error inicializando la aplicación');
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initAuth();

    // Configurar listener de cambios de autenticación (solo una vez)
    if (!subscriptionRef.current) {
      const { data: { subscription } } = authService.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state change:', event);
          
          // Evitar procesar durante inicialización
          if (initializingRef.current) {
            console.log('🔧 Ignorando auth change durante inicialización');
            return;
          }
          
          const currentUser = session?.user || null;
          
          // Solo procesar cambios reales de usuario
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (currentUser && currentUser.id !== user?.id) {
              console.log('👤 Usuario logueado:', currentUser.email);
              setUser(currentUser);
              // No mostrar loading para cambios de sesión
              await loadUserProfile(currentUser.id, true);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('👤 Usuario deslogueado');
            setUser(null);
            setProfile(null);
            setError(null);
            setRequiresPasswordChange(false);
            setShowPasswordModal(false);
            profileLoadedRef.current = null;
          }
          // Ignorar otros eventos como INITIAL_SESSION para evitar loops
        }
      );
      
      subscriptionRef.current = subscription;
    }

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      initializingRef.current = false;
    };
  }, []); // Dependencias vacías para ejecutar solo una vez

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