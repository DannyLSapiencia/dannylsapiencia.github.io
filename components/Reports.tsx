import React, { useState } from 'react';
import { Database } from '../types';
import { FileDown, Printer, Users, UserCheck, FileSpreadsheet } from 'lucide-react';

interface Props {
  db: Database;
}

export const Reports: React.FC<Props> = ({ db }) => {
  const [printMode, setPrintMode] = useState<'none' | 'students' | 'parents' | 'cards'>('none');

  // Helper to download CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudentsCSV = () => {
    const header = "CI,RUDE,Apellidos,Nombres,Curso,Padre(CI),Modalidad,Beca\n";
    const rows = db.students.map(s => 
      `"${s.ci}","${s.rude}","${s.primerApellido} ${s.segundoApellido}","${s.nombres}","${s.curso}","${s.idPadre}","${s.esDistancia ? 'Virtual' : 'Presencial'}","${s.tipoBeca}"`
    ).join("\n");
    downloadCSV(header + rows, "Reporte_Estudiantes.csv");
  };

  const exportParentsCSV = () => {
    const header = "CI,Apellidos,Nombres,Celular,Hijos Inscritos\n";
    const rows = db.parents.map(p => {
        const count = db.students.filter(s => s.idPadre === p.ci).length;
        return `"${p.ci}","${p.primerApellido} ${p.segundoApellido}","${p.nombres}","${p.celular}","${count}"`;
    }).join("\n");
    downloadCSV(header + rows, "Reporte_Padres.csv");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-screen">
      <div className="flex justify-between items-center mb-8 no-print">
        <h2 className="text-2xl font-bold text-gray-800">Módulo de Reportes</h2>
        {printMode !== 'none' && (
            <div className="flex gap-2">
                 <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700">
                    <Printer className="mr-2" size={18}/> Imprimir / Guardar PDF
                </button>
                <button onClick={() => setPrintMode('none')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Cerrar Vista Previa
                </button>
            </div>
        )}
      </div>

      {/* DASHBOARD OF REPORTS (Hidden when printing) */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${printMode !== 'none' ? 'hidden' : ''}`}>
        
        {/* Report A: Students */}
        <div className="border rounded-xl p-6 hover:shadow-lg transition bg-blue-50">
            <div className="flex items-center mb-4 text-blue-800">
                <UserCheck size={32} className="mr-3"/>
                <h3 className="font-bold text-lg">Lista de Estudiantes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Detalle completo de inscritos, curso, modalidad y becas.</p>
            <div className="flex gap-2">
                <button onClick={exportStudentsCSV} className="flex-1 bg-green-600 text-white py-2 rounded flex justify-center items-center hover:bg-green-700 text-sm">
                    <FileSpreadsheet size={16} className="mr-2"/> Excel
                </button>
                <button onClick={() => setPrintMode('students')} className="flex-1 bg-gray-700 text-white py-2 rounded flex justify-center items-center hover:bg-gray-800 text-sm">
                    <FileDown size={16} className="mr-2"/> PDF
                </button>
            </div>
        </div>

        {/* Report B: Parents */}
        <div className="border rounded-xl p-6 hover:shadow-lg transition bg-purple-50">
            <div className="flex items-center mb-4 text-purple-800">
                <Users size={32} className="mr-3"/>
                <h3 className="font-bold text-lg">Lista de Padres</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Padres de familia con conteo de hijos inscritos.</p>
            <div className="flex gap-2">
                <button onClick={exportParentsCSV} className="flex-1 bg-green-600 text-white py-2 rounded flex justify-center items-center hover:bg-green-700 text-sm">
                    <FileSpreadsheet size={16} className="mr-2"/> Excel
                </button>
                <button onClick={() => setPrintMode('parents')} className="flex-1 bg-gray-700 text-white py-2 rounded flex justify-center items-center hover:bg-gray-800 text-sm">
                    <FileDown size={16} className="mr-2"/> PDF
                </button>
            </div>
        </div>

        {/* Report C: Cartillas */}
        <div className="border rounded-xl p-6 hover:shadow-lg transition bg-orange-50">
            <div className="flex items-center mb-4 text-orange-800">
                <Users size={32} className="mr-3"/>
                <h3 className="font-bold text-lg">Cartillas de Registro</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Fichas individuales por familia para archivo físico.</p>
            <div className="flex gap-2">
                <button onClick={() => setPrintMode('cards')} className="w-full bg-gray-700 text-white py-2 rounded flex justify-center items-center hover:bg-gray-800 text-sm">
                    <Printer size={16} className="mr-2"/> Generar PDF
                </button>
            </div>
        </div>
      </div>

      {/* PRINT VIEWS */}
      
      {/* 1. STUDENT LIST PRINT VIEW */}
      {printMode === 'students' && (
        <div className="print-section">
            <h1 className="text-center font-bold text-xl mb-4">REPORTE GENERAL DE ESTUDIANTES INSCRITOS - GESTIÓN 2026</h1>
            <table className="w-full border-collapse border border-gray-400 text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">RUDE</th>
                        <th className="border p-2">CI</th>
                        <th className="border p-2">Apellidos y Nombres</th>
                        <th className="border p-2">Curso</th>
                        <th className="border p-2">Modalidad</th>
                        <th className="border p-2">Beca</th>
                    </tr>
                </thead>
                <tbody>
                    {db.students.map(s => (
                        <tr key={s.id}>
                            <td className="border p-2 text-center">{s.rude}</td>
                            <td className="border p-2 text-center">{s.ci}</td>
                            <td className="border p-2">{s.primerApellido} {s.segundoApellido} {s.nombres}</td>
                            <td className="border p-2 text-center">{s.curso}</td>
                            <td className="border p-2 text-center">{s.esDistancia ? 'Virtual' : 'Presencial'}</td>
                            <td className="border p-2 text-center">{s.tipoBeca}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* 2. PARENT LIST PRINT VIEW */}
      {printMode === 'parents' && (
        <div className="print-section">
            <h1 className="text-center font-bold text-xl mb-4">NOMINA DE PADRES DE FAMILIA</h1>
            <table className="w-full border-collapse border border-gray-400 text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">CI</th>
                        <th className="border p-2">Apellidos y Nombres</th>
                        <th className="border p-2">Celular</th>
                        <th className="border p-2">Dirección</th>
                        <th className="border p-2">Hijos</th>
                    </tr>
                </thead>
                <tbody>
                    {db.parents.map(p => {
                        const count = db.students.filter(s => s.idPadre === p.ci).length;
                        return (
                            <tr key={p.id}>
                                <td className="border p-2 text-center">{p.ci}</td>
                                <td className="border p-2">{p.primerApellido} {p.segundoApellido} {p.nombres}</td>
                                <td className="border p-2 text-center">{p.celular}</td>
                                <td className="border p-2">{p.direccion}</td>
                                <td className="border p-2 text-center font-bold">{count}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
      )}

      {/* 3. CARTILLAS PRINT VIEW */}
      {printMode === 'cards' && (
        <div className="print-section">
            {db.parents.map((p, idx) => {
                const children = db.students.filter(s => s.idPadre === p.ci);
                if (children.length === 0) return null;
                
                return (
                    <div key={p.id} className={`mb-8 border-2 border-black p-8 ${idx > 0 ? 'page-break' : ''}`}>
                        <div className="text-center border-b-2 border-black pb-4 mb-4">
                            <h2 className="font-bold text-2xl">CARTILLA DE REGISTRO FAMILIAR</h2>
                            <p>Gestión 2026</p>
                        </div>
                        
                        <div className="mb-6 bg-gray-50 p-4 border border-gray-300">
                            <h3 className="font-bold border-b border-gray-400 mb-2">DATOS DEL TUTOR</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><strong>Nombre:</strong> {p.primerApellido} {p.segundoApellido} {p.nombres}</p>
                                <p><strong>CI:</strong> {p.ci}</p>
                                <p><strong>Celular:</strong> {p.celular} / {p.celular2}</p>
                                <p><strong>Dirección:</strong> {p.direccion}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold border-b border-gray-400 mb-2">HIJOS INSCRITOS</h3>
                            <table className="w-full text-sm border border-black">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="border p-2 text-left">Nombre Completo</th>
                                        <th className="border p-2 text-center">Curso</th>
                                        <th className="border p-2 text-center">RUDE</th>
                                        <th className="border p-2 text-center">Modalidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {children.map(c => (
                                        <tr key={c.id}>
                                            <td className="border p-2">{c.primerApellido} {c.nombres}</td>
                                            <td className="border p-2 text-center">{c.curso}</td>
                                            <td className="border p-2 text-center">{c.rude}</td>
                                            <td className="border p-2 text-center">{c.esDistancia ? 'Virtual' : 'Presencial'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-12 pt-8 border-t border-dashed border-gray-400 flex justify-between">
                            <div className="text-center w-48">
                                <div className="h-20 border border-gray-300 mb-2"></div>
                                <p className="text-xs">Firma Padre/Tutor</p>
                            </div>
                            <div className="text-center w-48">
                                <div className="h-20 mb-2"></div>
                                <p className="text-xs border-t border-black pt-2">Sello Unidad Educativa</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      <style>{`
        @media print {
            .no-print { display: none !important; }
            body { background: white; }
            .print-section { display: block; }
            .page-break { page-break-before: always; }
        }
      `}</style>
    </div>
  );
};