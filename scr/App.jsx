import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText, Trash2, Download, Wifi, WifiOff } from 'lucide-react';

const DocuAsesor = () => {
  const [files, setFiles] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Detectar estado de conexión
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Análisis local (sin conexión a internet)
  const analyzeLocalResponse = (content) => {
    const analysis = {
      score: 0,
      status: 'mal',
      issues: [],
      strengths: [],
      suggestions: []
    };

    // Verificar longitud
    if (content.length < 50) {
      analysis.issues.push('Respuesta muy corta - menos de 50 caracteres');
    } else if (content.length > 50) {
      analysis.score += 20;
      analysis.strengths.push('Longitud adecuada de respuesta');
    }

    // Verificar estructura
    const hasPunctuation = /[.!?]/.test(content);
    if (hasPunctuation) {
      analysis.score += 15;
      analysis.strengths.push('Uso correcto de puntuación');
    } else {
      analysis.issues.push('Falta puntuación adecuada');
    }

    // Verificar coherencia básica
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 2) {
      analysis.score += 15;
      analysis.strengths.push('Múltiples oraciones - buena estructura');
    }

    // Verificar palabras clave de calidad
    const qualityKeywords = ['porque', 'debido', 'por tanto', 'sin embargo', 'además', 'finalmente'];
    const hasQualityWords = qualityKeywords.some(word => 
      content.toLowerCase().includes(word)
    );
    if (hasQualityWords) {
      analysis.score += 20;
      analysis.strengths.push('Uso de conectores y palabras de calidad');
    }

    // Verificar repetición excesiva
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    const repeatedWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 3)
      .map(([word]) => word);
    
    if (repeatedWords.length > 0) {
      analysis.issues.push(Repetición excesiva de palabras: ${repeatedWords.join(', ')});
    } else {
      analysis.score += 10;
    }

    // Verificar información específica
    const hasNumbers = /\d/.test(content);
    const hasExamples = /ejemplo|por ejemplo|como|tal como/i.test(content);
    
    if (hasNumbers || hasExamples) {
      analysis.score += 20;
      analysis.strengths.push('Incluye datos específicos o ejemplos');
    } else {
      analysis.suggestions.push('Agregar ejemplos concretos o datos específicos');
    }

    // Determinar estado final
    if (analysis.score >= 70) {
      analysis.status = 'bien';
    } else if (analysis.score >= 40) {
      analysis.status = 'regular';
    } else {
      analysis.status = 'mal';
    }

    // Agregar sugerencias generales
    if (analysis.issues.length > 0) {
      analysis.suggestions.push('Revisar los problemas identificados');
    }
    if (analysis.score < 50) {
      analysis.suggestions.push('Desarrollar más la respuesta con detalles adicionales');
    }

    return analysis;
  };

  // Análisis avanzado (con conexión a internet)
  const analyzeOnlineResponse = async (content) => {
    // Simulación de análisis más avanzado con IA
    // En implementación real, aquí harías una llamada a una API de IA
    
    const baseAnalysis = analyzeLocalResponse(content);
    
    // Simulamos análisis más profundo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mejoras del análisis online
    const advancedAnalysis = { ...baseAnalysis };
    
    // Análisis de sentimiento simulado
    const positiveWords = ['bueno', 'excelente', 'correcto', 'adecuado', 'óptimo'];
    const negativeWords = ['malo', 'incorrecto', 'inadecuado', 'error', 'problema'];
    
    const hasPositive = positiveWords.some(word => content.toLowerCase().includes(word));
    const hasNegative = negativeWords.some(word => content.toLowerCase().includes(word));
    
    if (hasPositive && !hasNegative) {
      advancedAnalysis.score += 10;
      advancedAnalysis.strengths.push('Tono positivo y constructivo');
    }
    
    // Análisis de complejidad
    const avgWordLength = content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / content.split(/\s+/).length;
    if (avgWordLength > 5) {
      advancedAnalysis.score += 10;
      advancedAnalysis.strengths.push('Vocabulario rico y variado');
    }
    
    // Recalcular estado
    if (advancedAnalysis.score >= 70) {
      advancedAnalysis.status = 'bien';
    } else if (advancedAnalysis.score >= 40) {
      advancedAnalysis.status = 'regular';
    } else {
      advancedAnalysis.status = 'mal';
    }
    
    return advancedAnalysis;
  };

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          content: content,
          size: file.size,
          uploadDate: new Date().toLocaleString()
        };
        
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
    
    // Limpiar input
    event.target.value = '';
  }, []);

  const analyzeFile = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      let analysis;
      if (isOnline) {
        analysis = await analyzeOnlineResponse(file.content);
      } else {
        analysis = analyzeLocalResponse(file.content);
      }
      
      setAnalyses(prev => ({
        ...prev,
        [fileId]: analysis
      }));
    } catch (error) {
      console.error('Error analyzing file:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setAnalyses(prev => {
      const newAnalyses = { ...prev };
      delete newAnalyses[fileId];
      return newAnalyses;
    });
  };

  const exportAnalysis = (fileId) => {
    const file = files.find(f => f.id === fileId);
    const analysis = analyses[fileId];
    
    if (!file || !analysis) return;
    
    const report = {
      archivo: file.name,
      fecha: new Date().toLocaleString(),
      puntuacion: analysis.score,
      estado: analysis.status,
      fortalezas: analysis.strengths,
      problemas: analysis.issues,
      sugerencias: analysis.suggestions
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = analisis_${file.name}_${Date.now()}.json;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'bien': return 'text-green-600 bg-green-100';
      case 'regular': return 'text-yellow-600 bg-yellow-100';
      case 'mal': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'bien': return <CheckCircle className="w-5 h-5" />;
      case 'regular': return <AlertCircle className="w-5 h-5" />;
      case 'mal': return <XCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">DA</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">DocuAsesor</h1>
                <p className="text-gray-400 mt-2">Evalúa la calidad de respuestas generadas por inteligencia artificial</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center text-blue-400">
                  <Wifi className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">En línea</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <WifiOff className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Sin conexión</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Subir Archivos</h2>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Arrastra archivos aquí o haz clic para seleccionar</p>
            <input
              type="file"
              multiple
              accept=".txt,.md,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Seleccionar Archivos
            </label>
            <p className="text-sm text-gray-400 mt-2">Soporta: .txt, .md, .json</p>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Archivos Cargados ({files.length})
            </h2>
            <div className="space-y-4">
              {files.map(file => {
                const analysis = analyses[file.id];
                return (
                  <div key={file.id} className="border border-gray-700 bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-white">{file.name}</span>
                          <span className="text-sm text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                          <span className="text-sm text-gray-400">{file.uploadDate}</span>
                        </div>
                        
                        {analysis && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(analysis.status)}}>
                                {getStatusIcon(analysis.status)}
                                <span className="font-medium capitalize">{analysis.status}</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                Puntuación: {analysis.score}/100
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              {analysis.strengths.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-green-700 mb-1">Fortalezas:</h4>
                                  <ul className="text-green-600 space-y-1">
                                    {analysis.strengths.map((strength, idx) => (
                                      <li key={idx}>• {strength}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysis.issues.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-red-700 mb-1">Problemas:</h4>
                                  <ul className="text-red-600 space-y-1">
                                    {analysis.issues.map((issue, idx) => (
                                      <li key={idx}>• {issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysis.suggestions.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-blue-700 mb-1">Sugerencias:</h4>
                                  <ul className="text-blue-600 space-y-1">
                                    {analysis.suggestions.map((suggestion, idx) => (
                                      <li key={idx}>• {suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!analysis && (
                          <button
                            onClick={() => analyzeFile(file.id)}
                            disabled={isAnalyzing}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                          >
                            {isAnalyzing ? 'Analizando...' : 'Analizar'}
                          </button>
                        )}
                        
                        {analysis && (
                          <button
                            onClick={() => exportAnalysis(file.id)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-gray-900 rounded-lg p-6 mt-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Información del Sistema</h3>
          <div className="text-gray-300 space-y-2">
            <p>• <strong>Modo Online:</strong> Análisis avanzado con evaluación profunda de contenido</p>
            <p>• <strong>Modo Offline:</strong> Análisis básico usando algoritmos locales</p>
            <p>• <strong>Criterios de evaluación:</strong> Longitud, estructura, coherencia, vocabulario y especificidad</p>
            <p>• <strong>Puntuación:</strong> 0-39 (Mal), 40-69 (Regular), 70-100 (Bien)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocuAsesor;
