import { supabase } from './client.js';

export const realtimeService = {
  // Suscribirse a cambios en una tabla
  subscribeToTable(table, callback, filters = {}) {
    let channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...filters
        },
        callback
      );

    channel.subscribe();
    return channel;
  },

  // Suscribirse a cambios en asistencia (para notificaciones en tiempo real)
  subscribeToAsistencia(callback) {
    return this.subscribeToTable('asistencia_plantel', callback);
  },

  // Suscribirse a cambios en incidentes (para alertas a Trabajo Social)
  subscribeToIncidentes(callback) {
    return this.subscribeToTable('incidentes', callback);
  },

  // Suscribirse a cambios en calificaciones
  subscribeToCalificaciones(cicloId, callback) {
    return this.subscribeToTable('calificaciones', callback, {
      filter: `ciclo_escolar_id=eq.${cicloId}`
    });
  },

  // Desuscribirse de un canal
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  },

  // Desuscribirse de todos los canales
  unsubscribeAll() {
    supabase.removeAllChannels();
  }
};