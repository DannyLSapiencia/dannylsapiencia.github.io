import React, { useState, useRef } from 'react';
import { Database } from '../types';
import { generateSqlDump } from '../services/sqlExport';
import { validateDB, saveDB } from '../services/db';
import { Database as DbIcon, Download, Lock, CheckCircle, AlertTriangle, Upload, FileJson, FileCode } from 'lucide-react';

interface Props {
  db: Database;
  onDbUpdate?: (newDb: Database) => void; // Optional callback if parent needs update immediately
}

export const DbAdmin: React.FC<Props> = ({ db }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'DBAdmin' && password === 'Teffy1914') {
        setIsAuthenticated(true);
        setError('');
    } else {
        setError('Credenciales inválidas');
    }
  };

  const handleExportSql = () => {
    const sqlContent = generateSqlDump(db);
    downloadFile(sqlContent, `escuela_db_backup_${getDateStr()}.sql`, 'text/sql');
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(db, null, 2);
    downloadFile(jsonContent, `db.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getDateStr = () => new Date().toISOString().split('T')[0];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (validateDB(json)) {
                if (window.confirm("¿Estás seguro de reemplazar TODA la base de datos actual con este archivo? Esta acción no se puede deshacer.")) {
                    saveDB(json);
                    alert("Base de datos actualizada correctamente. La página se recargará.");
                    window.location.reload();
                }
            } else {
                alert("El archivo seleccionado no tiene una estructura de base de datos válida.");
            }
        } catch (err) {
            alert("Error al leer el archivo JSON.");
        }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isAuthenticated) {
    return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm border border-gray-200">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Lock className="text-blue-600" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Acceso DB Admin</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input 
                            type="password" 
                            className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold flex items-center text-gray-800">
                <DbIcon className="mr-2" /> Administración de Base de Datos
            </h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle size={14} className="mr-1"/> Conectado como DBAdmin
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* JSON SECTION */}
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 shadow-sm">
                <div className="flex items-center mb-4">
                     <FileJson className="text-indigo-600 mr-2" size={24} />
                     <h3 className="font-bold text-lg text-indigo-900">Documento de Base de Datos (JSON)</h3>
                </div>
                <p className="text-sm text-indigo-700 mb-4 text-justify">
                    Este archivo <code>db.json</code> contiene toda la información de la aplicación. 
                    Es el formato nativo para realizar copias de seguridad portátiles o para alojarlo en un repositorio.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleExportJson}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center shadow transition font-medium"
                    >
                        <Download className="mr-2" size={18} /> Descargar db.json
                    </button>
                    
                    <div className="relative">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button 
                            onClick={handleImportClick}
                            className="w-full bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-4 py-3 rounded-lg flex items-center justify-center shadow-sm transition font-medium"
                        >
                            <Upload className="mr-2" size={18} /> Importar / Restaurar db.json
                        </button>
                    </div>
                </div>
                <p className="text-xs text-indigo-500 mt-3 text-center">
                    * Al importar, se reemplazarán todos los datos actuales.
                </p>
            </div>

            {/* SQL SECTION */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                     <FileCode className="text-blue-600 mr-2" size={24} />
                     <h3 className="font-bold text-lg text-blue-900">Exportar SQL (MySQL/MariaDB)</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4 text-justify">
                    Genera un script SQL completo con estructura y datos para migrar a un servidor de base de datos tradicional.
                </p>
                <div className="flex-1 content-end">
                     <button 
                        onClick={handleExportSql}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center shadow transition font-medium mt-auto"
                    >
                        <Download className="mr-2" size={18} /> Descargar Script SQL
                    </button>
                </div>
            </div>
        </div>

        {/* STATUS SECTION */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
            <h3 className="font-bold text-lg mb-2 text-yellow-900 flex items-center">
                <AlertTriangle size={20} className="mr-2"/> Estado del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-3 rounded border border-yellow-200">
                    <span className="text-gray-600 text-sm block">Padres Registrados</span>
                    <span className="font-mono font-bold text-xl">{db.parents.length}</span>
                </div>
                <div className="bg-white p-3 rounded border border-yellow-200">
                    <span className="text-gray-600 text-sm block">Estudiantes Inscritos</span>
                    <span className="font-mono font-bold text-xl">{db.students.length}</span>
                </div>
                <div className="bg-white p-3 rounded border border-yellow-200">
                    <span className="text-gray-600 text-sm block">Contratos Vigentes</span>
                    <span className="font-mono font-bold text-xl">{db.contracts.length}</span>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
                Nota: La aplicación funciona localmente. Para persistir los datos entre diferentes dispositivos o sesiones de incógnito, asegúrese de descargar el <strong>Documento de Base de Datos (db.json)</strong> periódicamente.
            </div>
        </div>
    </div>
  );
};