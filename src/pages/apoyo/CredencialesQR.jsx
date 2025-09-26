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
  const [error, setError] = useState('');
  const [showCredential, setShowCredential] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const credentialRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Cargando datos para credenciales...');
      
      // Cargar personal
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
        .maybeSingle();

      if (cicloError) throw cicloError;

      setPersonal(personalData || []);
      setCTInfo(ctData);
      setCicloActivo(cicloData);
      setError('');
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(`Error cargando datos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRData = (person) => {
    return JSON.stringify({
      type: "staff_credential",
      id: person.id,
      ct: ctInfo?.clave_ct,
      name: person.nombre_completo,
      role: person.rol,
      ciclo: cicloActivo?.nombre,
      issued: new Date().toISOString().split('T')[0] // Solo fecha
    });
  };

  // Función mejorada para generar QR que evita recarga constante
  const generateStableQR = async (data) => {
    // Crear un hash simple de los datos para cache
    const dataHash = btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    
    // Si ya tenemos este QR, no lo regeneramos
    if (qrDataUrl && qrDataUrl.includes(dataHash)) {
      return qrDataUrl;
    }

    // Usar API más estable con cache
    const encodedData = encodeURIComponent(data);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&ecc=M&margin=1&data=${encodedData}`;
    
    setQrDataUrl(qrUrl);
    return qrUrl;
  };

  const handleGenerateCredential = async (person) => {
    setSelectedPerson(person);
    const qrData = generateQRData(person);
    await generateStableQR(qrData);
    setShowCredential(true);
  };

  const getRoleIcon = (rol) => {
    const icons = {
      'Director': '👔',
      'Subdirector': '📋', 
      'Trabajo Social': '🤝',
      'Maestro': '👩‍🏫',
      'Apoyo': '📝',
      'Acceso': '🚪'
    };
    return icons[rol] || '👤';
  };

  const getRoleColor = (rol) => {
    const colors = {
      'Director': 'from-purple-600 to-purple-800',
      'Subdirector': 'from-blue-600 to-blue-800',
      'Trabajo Social': 'from-green-600 to-green-800',
      'Maestro': 'from-indigo-600 to-indigo-800',
      'Apoyo': 'from-orange-600 to-orange-800',
      'Acceso': 'from-gray-600 to-gray-800'
    };
    return colors[rol] || 'from-gray-600 to-gray-800';
  };

  const handlePrint = () => {
    if (credentialRef.current) {
      const printWindow = window.open('', '_blank');
      const gradientColor = getRoleColor(selectedPerson?.rol);
      
      // Convertir gradientes Tailwind a CSS válido
      const getGradientCSS = (gradientClass) => {
        const gradientMap = {
          'from-purple-600 to-purple-800': 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
          'from-blue-600 to-blue-800': 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          'from-green-600 to-green-800': 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
          'from-indigo-600 to-indigo-800': 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          'from-orange-600 to-orange-800': 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
          'from-gray-600 to-gray-800': 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)'
        };
        return gradientMap[gradientClass] || gradientMap['from-gray-600 to-gray-800'];
      };

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Credencial - ${selectedPerson.nombre_completo}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: #f8fafc;
                padding: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .credential {
                width: 320px;
                height: 192px;
                background: ${getGradientCSS(gradientColor)};
                color: white;
                border-radius: 12px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                position: relative;
                overflow: hidden;
                transform: scale(1.2);
              }
              
              .background-pattern {
                position: absolute;
                inset: 0;
                opacity: 0.1;
              }
              
              .circle-1 {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 96px;
                height: 96px;
                border: 2px solid white;
                border-radius: 50%;
              }
              
              .circle-2 {
                position: absolute;
                bottom: 16px;
                left: 16px;
                width: 64px;
                height: 64px;
                border: 1px solid white;
                border-radius: 50%;
              }
              
              .circle-3 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 128px;
                height: 128px;
                border: 1px solid white;
                border-radius: 50%;
                transform: translate(-50%, -50%);
              }
              
              .header {
                position: relative;
                z-index: 10;
                text-align: center;
                padding: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              }
              
              .institution-name {
                font-size: 10px;
                font-weight: bold;
                line-height: 1.2;
                margin-bottom: 4px;
              }
              
              .ct-code {
                font-size: 10px;
                opacity: 0.9;
                font-weight: 500;
              }
              
              .content {
                position: relative;
                z-index: 10;
                display: flex;
                align-items: center;
                padding: 16px;
                height: 128px;
              }
              
              .info {
                flex: 1;
                margin-right: 16px;
              }
              
              .employee-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
              }
              
              .employee-role {
                font-size: 10px;
                opacity: 0.9;
                font-weight: 500;
                margin-bottom: 4px;
              }
              
              .employee-id {
                font-size: 10px;
                opacity: 0.75;
                margin-bottom: 4px;
              }
              
              .cycle-info {
                font-size: 10px;
                opacity: 0.75;
              }
              
              .qr-container {
                width: 80px;
                height: 80px;
                background: white;
                padding: 8px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .qr-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                image-rendering: crisp-edges;
              }
              
              .footer {
                position: absolute;
                bottom: 8px;
                left: 16px;
                right: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                opacity: 0.7;
                z-index: 10;
              }
              
              @media print {
                body { 
                  margin: 0; 
                  padding: 20px; 
                  background: white;
                }
                .credential { 
                  page-break-inside: avoid; 
                  margin: 0 auto;
                  transform: scale(1.5);
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="credential">
              <div class="background-pattern">
                <div class="circle-1"></div>
                <div class="circle-2"></div>
                <div class="circle-3"></div>
              </div>
              
              <div class="header">
                <div class="institution-name">
                  ${ctInfo?.nombre_oficial || 'INSTITUCIÓN EDUCATIVA'}
                </div>
                <div class="ct-code">
                  CLAVE CT: ${ctInfo?.clave_ct || 'N/A'}
                </div>
              </div>

              <div class="content">
                <div class="info">
                  <div class="employee-name">
                    ${selectedPerson?.nombre_completo || ''}
                  </div>
                  <div class="employee-role">
                    ${selectedPerson?.rol || ''}
                  </div>
                  <div class="employee-id">
                    ID: ${selectedPerson?.id?.slice(0, 8) || ''}...
                  </div>
                  <div class="cycle-info">
                    Ciclo: ${cicloActivo?.nombre || 'N/A'}
                  </div>
                </div>
                
                <div class="qr-container">
                  <img src="${qrDataUrl}" alt="QR Code" class="qr-image" />
                </div>
              </div>

              <div class="footer">
                <span>EDUQUIARMX</span>
                <span>${new Date().getFullYear()}</span>
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Esperar a que la imagen se cargue antes de imprimir
      setTimeout(() => {
        printWindow.print();
      }, 500);
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
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generador de Credenciales QR</h1>
              <p className="text-gray-600 mt-1">
                Sistema profesional de credenciales institucionales con códigos QR
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sistema Activo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error de Carga</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información del CT */}
      {!error && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">Información Institucional</h3>
              <p className="text-blue-700 text-sm">Datos que aparecerán en las credenciales</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Institución</p>
                  <p className="text-sm text-gray-600">{ctInfo?.nombre_oficial || 'No configurado'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Clave CT</p>
                  <p className="text-sm text-gray-600 font-mono">{ctInfo?.clave_ct || 'No configurado'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Ciclo Escolar</p>
                  <p className="text-sm text-gray-600">{cicloActivo?.nombre || 'No configurado'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-blue-600 bg-blue-100 rounded px-3 py-2">
            Personal registrado: {personal.length} | CT: {ctInfo ? '✓' : '✗'} | Ciclo: {cicloActivo ? '✓' : '✗'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Personal */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Personal Disponible</h2>
            <p className="text-sm text-gray-600 mt-1">
              {personal.length} personas registradas en el sistema
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {personal.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2m16 0H4m16 0v-1a3 3 0 00-3-3h-1m-2 3h4" />
                </svg>
                <p className="mt-2">No hay personal registrado</p>
              </div>
            ) : (
              personal.map((person) => (
                <div key={person.id} className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-xl mr-3">{getRoleIcon(person.rol)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {person.nombre_completo}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">{person.rol}</p>
                        <p className="text-xs text-gray-500 truncate">{person.email}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleGenerateCredential(person)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Generar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vista Previa de Credencial */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Vista Previa de Credencial</h2>
            {selectedPerson && (
              <p className="text-sm text-gray-600 mt-1">
                Credencial institucional para: {selectedPerson.nombre_completo} ({selectedPerson.rol})
              </p>
            )}
          </div>
          
          <div className="p-6">
            {!showCredential ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Listo para generar credenciales</h3>
                <p className="text-gray-500">Selecciona una persona de la lista para generar su credencial institucional con código QR</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Credencial Profesional */}
                <div className="flex justify-center">
                  <div 
                    ref={credentialRef}
                    className="transform scale-110 origin-center"
                  >
                    <div className={`w-80 h-48 bg-gradient-to-br ${getRoleColor(selectedPerson?.rol)} text-white rounded-xl shadow-2xl relative overflow-hidden`}>
                      {/* Patrón de fondo sutil */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                      
                      {/* Header institucional */}
                      <div className="relative z-10 text-center p-3 border-b border-white border-opacity-20">
                        <div className="text-xs font-bold leading-tight mb-1">
                          {ctInfo?.nombre_oficial}
                        </div>
                        <div className="text-xs opacity-90 font-medium">
                          CLAVE CT: {ctInfo?.clave_ct}
                        </div>
                      </div>

                      {/* Contenido principal */}
                      <div className="relative z-10 flex items-center p-4 h-32">
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-bold">
                            {selectedPerson?.nombre_completo}
                          </div>
                          <div className="text-xs opacity-90 font-medium">
                            {selectedPerson?.rol}
                          </div>
                          <div className="text-xs opacity-75">
                            ID: {selectedPerson?.id.slice(0, 8)}...
                          </div>
                          <div className="text-xs opacity-75">
                            Ciclo: {cicloActivo?.nombre || 'N/A'}
                          </div>
                        </div>
                        
                        {/* QR Code */}
                        <div className="ml-4">
                          <div className="w-20 h-20 bg-white p-2 rounded-lg shadow-lg">
                            {qrDataUrl && (
                              <img 
                                src={qrDataUrl}
                                alt="QR Code"
                                className="w-full h-full object-contain"
                                style={{ imageRendering: 'crisp-edges' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-xs opacity-70">
                        <span>EDUQUIARMX</span>
                        <span>{new Date().getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del QR */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Datos del Código QR
                  </h4>
                  <div className="bg-white rounded p-3 border">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {selectedPerson && JSON.stringify(JSON.parse(generateQRData(selectedPerson)), null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Credencial
                  </button>
                  <button
                    onClick={() => {
                      setShowCredential(false);
                      setSelectedPerson(null);
                      setQrDataUrl('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Nueva Credencial
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Sistema Profesional de Credenciales
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• <strong>Códigos QR seguros:</strong> Cada credencial incluye información encriptada y verificable</p>
              <p>• <strong>Diseño institucional:</strong> Credenciales personalizadas por rol con colores distintivos</p>
              <p>• <strong>Impresión optimizada:</strong> Formato estándar para impresión en alta calidad</p>
              <p>• <strong>Trazabilidad completa:</strong> Cada credencial queda registrada con fecha y ciclo escolar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredencialesQR;