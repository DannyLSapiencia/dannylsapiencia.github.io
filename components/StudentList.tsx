import React, { useState } from 'react';
import { Database, Student } from '../types';
import { generateId, getParentByCI, getStudentsByParent } from '../services/db';
import { GraduationCap, Plus, Save, X, Link as LinkIcon, Monitor, Star } from 'lucide-react';

interface Props {
  db: Database;
  updateDb: (newDb: Database) => void;
}

const COURSES = [
  "Inicial 1", "Inicial 2",
  "1ro de Primaria", "2do de Primaria", "3ro de Primaria", "4to de Primaria", "5to de Primaria", "6to de Primaria",
  "1ro de Secundaria", "2do de Secundaria", "3ro de Secundaria", "4to de Secundaria", "5to de Secundaria", "6to de Secundaria"
];

export const StudentList: React.FC<Props> = ({ db, updateDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({
    esDistancia: false,
    tipoBeca: 'Ninguna'
  });
  const [siblingCount, setSiblingCount] = useState(0);

  const handleParentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    setFormData({...formData, idPadre: pid});
    
    // Auto-detect sibling count for scholarships
    if (pid) {
        const siblings = getStudentsByParent(db, pid);
        setSiblingCount(siblings.length);
        // Suggest scholarship if this is the 3rd child or more
        if (siblings.length >= 2) {
            setFormData(prev => ({...prev, idPadre: pid, tipoBeca: 'Descuento Hermanos'}));
        } else {
            setFormData(prev => ({...prev, idPadre: pid, tipoBeca: 'Ninguna'}));
        }
    } else {
        setSiblingCount(0);
    }
  };

  const handleSave = () => {
    if (!formData.ci || !formData.nombres || !formData.primerApellido || !formData.idPadre || !formData.curso) {
        alert("CI, Nombres, Apellido, Padre y Curso son obligatorios");
        return;
    }

    if (db.students.some(s => s.ci === formData.ci)) {
        alert("Ya existe un estudiante con este CI");
        return;
    }

    // Validate Parent Exists
    const parentExists = getParentByCI(db, formData.idPadre);
    if (!parentExists) {
        alert("El ID del Padre (CI) no existe en la base de datos.");
        return;
    }

    const newStudent: Student = {
      id: generateId(),
      ci: formData.ci!,
      rude: formData.rude || '',
      nombres: formData.nombres!,
      primerApellido: formData.primerApellido!,
      segundoApellido: formData.segundoApellido || '',
      curso: formData.curso!,
      celular: formData.celular || '',
      idPadre: formData.idPadre!,
      esDistancia: formData.esDistancia || false,
      tipoBeca: formData.tipoBeca || 'Ninguna'
    };

    updateDb({ ...db, students: [...db.students, newStudent] });
    setIsModalOpen(false);
    setFormData({ esDistancia: false, tipoBeca: 'Ninguna' });
    setSiblingCount(0);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center text-gray-800">
          <GraduationCap className="mr-2" /> Estudiantes
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition"
        >
          <Plus size={18} className="mr-1" /> Nuevo Estudiante
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI / RUDE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {db.students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div>{student.ci}</div>
                  <div className="text-xs text-gray-500">RUDE: {student.rude}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.primerApellido} {student.segundoApellido} {student.nombres}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.curso}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <div className="flex flex-col space-y-1">
                     <span className="flex items-center text-blue-600 font-medium">
                        <LinkIcon size={14} className="mr-1"/> Padre: {student.idPadre}
                     </span>
                     {student.esDistancia && (
                        <span className="flex items-center text-purple-600 text-xs font-bold bg-purple-100 px-2 py-0.5 rounded w-fit">
                            <Monitor size={12} className="mr-1"/> Virtual
                        </span>
                     )}
                     {student.tipoBeca && student.tipoBeca !== 'Ninguna' && (
                        <span className="flex items-center text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-0.5 rounded w-fit">
                            <Star size={12} className="mr-1"/> {student.tipoBeca}
                        </span>
                     )}
                   </div>
                </td>
              </tr>
            ))}
             {db.students.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">No hay estudiantes registrados</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Registrar Estudiante</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Vincular Padre (CI)</label>
                    <select 
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                      value={formData.idPadre || ''}
                      onChange={handleParentSelect}
                    >
                      <option value="">-- Seleccionar Padre --</option>
                      {db.parents.map(p => (
                        <option key={p.id} value={p.ci}>
                          {p.ci} - {p.primerApellido} {p.nombres}
                        </option>
                      ))}
                    </select>
                    {siblingCount > 0 && (
                        <p className="text-xs text-blue-600 mt-1">Este padre ya tiene {siblingCount} hijo(s) inscrito(s).</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">CI</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.ci || ''} onChange={e => setFormData({...formData, ci: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">RUDE</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.rude || ''} onChange={e => setFormData({...formData, rude: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombres</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.nombres || ''} onChange={e => setFormData({...formData, nombres: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Primer Apellido</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.primerApellido || ''} onChange={e => setFormData({...formData, primerApellido: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Segundo Apellido</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.segundoApellido || ''} onChange={e => setFormData({...formData, segundoApellido: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Curso</label>
                    <select 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.curso || ''} 
                        onChange={e => setFormData({...formData, curso: e.target.value})}
                    >
                        <option value="">-- Seleccionar Curso --</option>
                        {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Celular (Estudiante)</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.celular || ''} onChange={e => setFormData({...formData, celular: e.target.value})} />
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center mb-4">
                        <input 
                            type="checkbox" 
                            id="distancia"
                            className="w-4 h-4 text-blue-600 rounded"
                            checked={formData.esDistancia || false}
                            onChange={e => setFormData({...formData, esDistancia: e.target.checked})}
                        />
                        <label htmlFor="distancia" className="ml-2 text-sm font-medium text-gray-700">Estudiante a distancia (Virtual)</label>
                    </div>

                    <label className="block text-sm font-medium text-gray-700">Beneficio / Beca</label>
                    <select 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
                        value={formData.tipoBeca || 'Ninguna'}
                        onChange={e => setFormData({...formData, tipoBeca: e.target.value})}
                    >
                        <option value="Ninguna">Ninguna</option>
                        <option value="Descuento Hermanos">Descuento Hermanos (3er hijo+)</option>
                        <option value="Beca Social">Beca Social (RM 001/2026)</option>
                        <option value="Beca Excelencia">Beca Excelencia</option>
                    </select>
                    {formData.tipoBeca !== 'Ninguna' && (
                        <p className="text-xs text-yellow-600 mt-1">
                            * El descuento correspondiente se aplicará al generar el contrato.
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <Save size={18} className="mr-2" /> Guardar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};