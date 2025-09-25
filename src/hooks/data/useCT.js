import { useState, useEffect } from 'react';
import { databaseService } from '@/services/supabase/database';

export const useCT = () => {
  const [ctInfo, setCTInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar información del CT
  const loadCTInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await databaseService.select('ct_info');
      
      if (error) {
        throw error;
      }

      setCTInfo(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      setError(err.message || 'Error al cargar información del CT');
      console.error('Error loading CT info:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar o actualizar información del CT
  const saveCTInfo = async (ctData) => {
    try {
      let result;
      
      if (ctInfo && ctInfo.id) {
        // Actualizar existente
        result = await databaseService.update('ct_info', ctInfo.id, ctData);
      } else {
        // Crear nuevo
        result = await databaseService.insert('ct_info', ctData);
      }

      if (result.error) {
        throw result.error;
      }

      // Actualizar estado local
      const savedData = result.data && result.data.length > 0 ? result.data[0] : ctData;
      setCTInfo(savedData);

      return { success: true, data: savedData };
    } catch (err) {
      const errorMessage = err.message || 'Error al guardar información del CT';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verificar si el CT está configurado
  const isConfigured = () => {
    return ctInfo && ctInfo.nombre_oficial && ctInfo.clave_ct;
  };

  // Cargar información al inicializar
  useEffect(() => {
    loadCTInfo();
  }, []);

  return {
    ctInfo,
    loading,
    error,
    saveCTInfo,
    loadCTInfo,
    isConfigured: isConfigured()
  };
};