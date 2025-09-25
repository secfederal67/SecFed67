import { supabase } from './client.js';

export const authService = {
  // Iniciar sesión
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Obtener perfil del usuario (con debug mejorado)
  async getUserProfile(userId) {
    try {
      console.log('🔧 Intentando obtener perfil con diferentes métodos...');
      
      // MÉTODO 1: Consulta directa simple
      console.log('🔧 Método 1: Consulta directa');
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('id, nombre_completo, rol, email, telefono, direccion, requires_password_change, password_changed_at')
        .eq('id', userId)
        .single();
      
      if (directError) {
        console.error('❌ Método 1 falló:', {
          message: directError.message,
          code: directError.code,
          details: directError.details,
          hint: directError.hint
        });
      } else {
        console.log('✅ Método 1 exitoso:', directData);
        return { profile: directData, error: null };
      }

      // MÉTODO 2: Consulta sin single()
      console.log('🔧 Método 2: Consulta sin single()');
      const { data: arrayData, error: arrayError } = await supabase
        .from('profiles')
        .select('*, requires_password_change, password_changed_at')
        .eq('id', userId);
      
      if (arrayError) {
        console.error('❌ Método 2 falló:', arrayError);
      } else {
        console.log('✅ Método 2 resultado:', arrayData);
        if (arrayData && arrayData.length > 0) {
          return { profile: arrayData[0], error: null };
        }
      }

      // MÉTODO 3: RPC call directo
      console.log('🔧 Método 3: Consulta RPC personalizada');
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_profile_debug', {
          user_id: userId
        });
        
        if (!rpcError && rpcData) {
          console.log('✅ Método 3 exitoso:', rpcData);
          return { profile: rpcData, error: null };
        }
      } catch (rpcErr) {
        console.warn('⚠️ Método 3 no disponible (función RPC no existe)');
      }

      // Si todos los métodos fallan
      return { 
        profile: null, 
        error: directError || arrayError || new Error('No se pudo obtener el perfil por ningún método')
      };
      
    } catch (error) {
      console.error('💥 Error inesperado en getUserProfile:', error);
      return { profile: null, error };
    }
  },

  // Escuchar cambios en la autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};