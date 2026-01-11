import React, { useState } from 'react';
import { Database, Parent } from '../types';
import { generateId } from '../services/db';
import { Users, Plus, Save, X } from 'lucide-react';

interface Props {
  db: Database;
  updateDb: (newDb: Database) => void;
}

export const ParentList: React.FC<Props> = ({ db, updateDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Parent>>({});

  const handleSave = () => {
    if (!formData.ci || !formData.nombres || !formData.primerApellido) {
        alert("CI, Nombres y Primer Apellido son obligatorios");
        return;
    }

    if (db.parents.some(p => p.ci === formData.ci)) {
        alert("Ya existe un padre con este CI");
        return;
    }

    const newParent: Parent = {
      id: generateId(),
      ci: formData.ci!,
      nombres: formData.nombres!,
      primerApellido: formData.primerApellido!,
      segundoApellido: formData.segundoApellido || '',
      celular: formData.celular || '',
      celular2: formData.celular2 || '',
      direccion: formData.direccion || ''
    };

    updateDb({ ...db, parents: [...db.parents, newParent] });
    setIsModalOpen(false);
    setFormData({});
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center text-gray-800">
          <Users className="mr-2" /> Padres de Familia
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition"
        >
          <Plus size={18} className="mr-1" /> Nuevo Padre
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {db.parents.map((parent) => (
              <tr key={parent.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parent.ci}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parent.primerApellido} {parent.segundoApellido} {parent.nombres}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parent.celular}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{parent.direccion}</td>
              </tr>
            ))}
            {db.parents.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">No hay padres registrados</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Registrar Padre</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">CI (Identificador Único)</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.ci || ''} onChange={e => setFormData({...formData, ci: e.target.value})} />
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
                    <label className="block text-sm font-medium text-gray-700">Celular</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.celular || ''} onChange={e => setFormData({...formData, celular: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Celular 2 (Opcional)</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.celular2 || ''} onChange={e => setFormData({...formData, celular2: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                        value={formData.direccion || ''} onChange={e => setFormData({...formData, direccion: e.target.value})} />
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