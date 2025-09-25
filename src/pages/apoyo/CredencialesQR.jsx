import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/services/supabase/client';

const CredencialesQR = () => {
  const { profile } = useAuth();
  const [personal, setPersonal] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [ctInfo, setCTInfo] = useState(null);
  const [cicloActivo, setCicloActivo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCredential, setShowCredential] = useState(false);
  const credentialRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar personal (incluyendo al usuario actual)
      const { data: personalData, error: personalError } = await supabase
        .from('profiles')
        .select('id, nombre_completo, rol, email, telefono')
        .order('nombre_completo');

      if (personalError) throw personalError;

      // Cargar información del CT
      const { data: ctData, error: ctError } = await supabase
        .from('ct_info')
        .select('*')
        .single();

      if (ctError) throw ctError;

      // Cargar ciclo activo
      const { data: cicloData, error: cicloError } = await supabase
        .from('ciclos_escolares')
        .select('*')
        .eq('estatus', 'Activo')
        .single();

      if (cicloError) throw cicloError;

      setPersonal(personalData || []);
      setCTInfo(ctData);
      setCicloActivo(cicloData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRData = (person) => {
    return JSON.stringify({
      type: "demo_credential",
      id: person.id,
      ct: ctInfo?.clave_ct,
      name: person.nombre_completo,
      role: person.rol,
      ciclo: cicloActivo?.nombre,
      issued: new Date().toISOString()
    });
  };

  const generateQRCode = (data) => {
    // Usar una API pública para generar QR
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
  };

  const handleGenerateCredential = (person) => {
    setSelectedPerson(person);
    setShowCredential(true);
  };

  const handlePrint = () => {
    if (credentialRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Credencial - ${selectedPerson.nombre_completo}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                background: white;
              }
              .credential {
                width: 85.6mm;
                height: 53.98mm;
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                position: relative;
                overflow: hidden;
              }
              .header { 
                text-align: center; 
                margin-bottom: 8px;
                font-size: 10px;
              }
              .school-name { 
                font-weight: bold; 
                font-size: 11px;
                margin-bottom: 2px;
              }
              .content { 
                display: flex; 
                align-items: center;
                height: calc(100% - 40px);
              }
              .info { 
                flex: 1; 
                font-size: 9px;
                line-height: 1.3;
              }
              .qr { 
                width: 60px; 
                height: 60px;
                background: white;
                padding: 4px;
                border-radius: 4px;
                margin-left: 8px;
              }
              .qr img {
                width: 100%;
                height: 100%;
              }
              .name { 
                font-weight: bold; 
                font-size: 11px;
                margin-bottom: 3px;
              }
              .role {
                font-size: 9px;
                opacity: 0.9;
                margin-bottom: 2px;
              }
              .id {
                font-size: 8px;
                opacity: 0.8;
              }
              .footer {
                position: absolute;
                bottom: 4px;
                right: 8px;
                font-size: 7px;
                opacity: 0.7;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .credential { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            ${credentialRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos para credenciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Credenciales QR - Demo</h1>
              <p className="text-gray-600 mt-1">
                Generador de credenciales usando datos del personal (Demo visual)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del CT */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Información de la Credencial</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Institución:</span>
            <p className="text-blue-700">{ctInfo?.nombre_oficial}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Clave CT:</span>
            <p className="text-blue-700">{ctInfo?.clave_ct}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Ciclo:</span>
            <p className="text-blue-700">{cicloActivo?.nombre}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Personal */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Personal Disponible para Demo</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona una persona para generar su credencial de prueba
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {personal.map((person) => (
              <div key={person.id} className="px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {person.nombre_completo}
                    </p>
                    <p className="text-sm text-gray-500">{person.rol}</p>
                    <p className="text-xs text-gray-400">{person.email}</p>
                  </div>
                  <button
                    onClick={() => handleGenerateCredential(person)}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Generar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista Previa de Credencial */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Vista Previa de Credencial</h2>
            {selectedPerson && (
              <p className="text-sm text-gray-500 mt-1">
                Credencial para: {selectedPerson.nombre_completo}
              </p>
            )}
          </div>
          
          <div className="p-6">
            {!showCredential ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 2v20M14 2v20M4 7h16M4 17h16" />
                  </svg>
                </div>
                <p className="text-gray-500">Selecciona una persona para generar su credencial</p>
              </div>
            ) : (
              <div className="text-center">
                {/* Credencial */}
                <div 
                  ref={credentialRef}
                  className="inline-block mx-auto mb-4"
                  style={{ 
                    width: '320px', 
                    height: '200px',
                    transform: 'scale(1.2)',
                    transformOrigin: 'center'
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-lg p-3 relative overflow-hidden shadow-lg">
                    {/* Header */}
                    <div className="text-center mb-2">
                      <div className="text-xs font-bold leading-tight">
                        {ctInfo?.nombre_oficial}
                      </div>
                      <div className="text-xs opacity-90">
                        {ctInfo?.clave_ct}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex items-center h-24">
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold mb-1">
                          {selectedPerson?.nombre_completo}
                        </div>
                        <div className="text-xs opacity-90 mb-1">
                          {selectedPerson?.rol}
                        </div>
                        <div className="text-xs opacity-80">
                          ID: {selectedPerson?.id.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-white p-1 rounded ml-2">
                        <img 
                          src={generateQRCode(generateQRData(selectedPerson))}
                          alt="QR Code"
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-1 right-2 text-xs opacity-70">
                      {cicloActivo?.nombre}
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>
                  </div>
                </div>

                {/* Información del QR */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Datos en el QR:</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {selectedPerson && JSON.stringify(JSON.parse(generateQRData(selectedPerson)), null, 2)}
                  </pre>
                </div>

                {/* Botones */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <span className="mr-2">🖨️</span>
                    Imprimir
                  </button>
                  <button
                    onClick={() => setShowCredential(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Nueva Credencial
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nota Informativa */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Modo Demo
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Esta es una demostración funcional usando datos del personal existente. Las credenciales generadas contienen códigos QR funcionales pero son solo para propósitos de prueba.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredencialesQR;