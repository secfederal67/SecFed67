import { supabase } from './client.js';

export const databaseService = {
  // Operaciones CRUD genéricas
  async select(table, columns = '*', filters = {}) {
    try {
      let query = supabase.from(table).select(columns);
      
      // Aplicar filtros dinámicamente
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(table, id, updates) {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Queries específicas para EDUQUIARMX
  async getCicloActivo() {
    try {
      const { data, error } = await supabase
        .from('ciclos_escolares')
        .select('*')
        .eq('estatus', 'Activo')
        .single();
      
      if (error) throw error;
      return { ciclo: data, error: null };
    } catch (error) {
      return { ciclo: null, error };
    }
  },

  async getExpedienteAlumno(inscripcionId) {
    try {
      const { data, error } = await supabase
        .from('expediente_alumno')
        .select('*')
        .eq('inscripcion_id', inscripcionId)
        .single();
      
      if (error) throw error;
      return { expediente: data, error: null };
    } catch (error) {
      return { expediente: null, error };
    }
  }
};