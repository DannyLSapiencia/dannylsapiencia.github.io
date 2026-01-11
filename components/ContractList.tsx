import React, { useState } from 'react';
import { Database, Contract, PaymentType, Student } from '../types';
import { generateId, getStudentsByParent } from '../services/db';
import { FileText, Plus, Eye, Save, X, Calculator } from 'lucide-react';
import { ContractDocument } from './ContractDocument';

interface Props {
  db: Database;
  updateDb: (newDb: Database) => void;
}

export const ContractList: React.FC<Props> = ({ db, updateDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewContractId, setViewContractId] = useState<string | null>(null);
  
  // Form State
  const [selectedParentId, setSelectedParentId] = useState('');
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.MENSUAL);
  const [annualAmount, setAnnualAmount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0); // New discount state
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    setSelectedParentId(pid);
    if (pid) {
        setAvailableStudents(getStudentsByParent(db, pid));
    } else {
        setAvailableStudents([]);
    }
    setSelectedStudentId('');
    setDiscountPercent(0);
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sid = e.target.value;
    setSelectedStudentId(sid);
    const student = availableStudents.find(s => s.ci === sid);
    
    // Auto-apply discount based on scholarship type
    if (student) {
        if (student.tipoBeca === 'Descuento Hermanos') {
            setDiscountPercent(10); // Example: 10% for siblings
        } else if (student.tipoBeca === 'Beca Social') {
            setDiscountPercent(20); // Example: 20% for social
        } else if (student.tipoBeca === 'Beca Excelencia') {
            setDiscountPercent(50);
        } else {
            setDiscountPercent(0);
        }
    }
  };

  const calculateTotal = (base: number, discount: number) => {
    return base - (base * (discount / 100));
  };

  const calculateInstallment = (base: number, discount: number, type: PaymentType): number => {
    const total = calculateTotal(base, discount);
    switch (type) {
        case PaymentType.GLOBAL: return total;
        case PaymentType.SEMESTRAL: return total / 2;
        case PaymentType.TRIMESTRAL: return total / 4;
        case PaymentType.MENSUAL: return total / 10; 
        default: return total;
    }
  };

  const handleSave = () => {
    if (!selectedParentId || !selectedStudentId || annualAmount <= 0) {
        alert("Seleccione padre, estudiante y monto válido.");
        return;
    }

    const finalTotal = calculateTotal(annualAmount, discountPercent);

    const newContract: Contract = {
        id: generateId(),
        numeroContrato: `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        idPadre: selectedParentId,
        idEstudiante: selectedStudentId,
        tipoPago: paymentType,
        montoAnual: finalTotal,
        descuento: discountPercent,
        montoCuota: calculateInstallment(annualAmount, discountPercent, paymentType),
        fechaFirma: contractDate
    };

    updateDb({ ...db, contracts: [...db.contracts, newContract] });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedParentId('');
    setSelectedStudentId('');
    setAvailableStudents([]);
    setAnnualAmount(0);
    setDiscountPercent(0);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center text-gray-800">
          <FileText className="mr-2" /> Contratos
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition"
        >
          <Plus size={18} className="mr-1" /> Nuevo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.contracts.map(contract => {
            const student = db.students.find(s => s.ci === contract.idEstudiante);
            return (
                <div key={contract.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{contract.numeroContrato}</span>
                            <h3 className="font-bold mt-2 text-gray-800">{student?.primerApellido} {student?.nombres}</h3>
                        </div>
                        <button onClick={() => setViewContractId(contract.id)} className="text-gray-500 hover:text-blue-600">
                            <Eye size={20} />
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>Tipo: <span className="font-medium">{contract.tipoPago}</span></p>
                        <p>Cuota: <span className="font-medium">{contract.montoCuota.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</span></p>
                        {contract.descuento > 0 && (
                            <p className="text-xs text-green-600 font-bold">Descuento aplicado: {contract.descuento}%</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Fecha: {contract.fechaFirma}</p>
                    </div>
                </div>
            );
        })}
        {db.contracts.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">No hay contratos registrados.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Generar Contrato</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Padre (Titular)</label>
                    <select className="w-full mt-1 border p-2 rounded" value={selectedParentId} onChange={handleParentChange}>
                        <option value="">-- Buscar por CI --</option>
                        {db.parents.map(p => (
                            <option key={p.id} value={p.ci}>{p.ci} - {p.primerApellido} {p.nombres}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Estudiante</label>
                    <select 
                        className="w-full mt-1 border p-2 rounded disabled:bg-gray-100" 
                        value={selectedStudentId} 
                        onChange={handleStudentChange}
                        disabled={!selectedParentId}
                    >
                        <option value="">-- Seleccionar --</option>
                        {availableStudents.map(s => (
                            <option key={s.id} value={s.ci}>
                                {s.rude} - {s.primerApellido} {s.nombres} 
                                {s.tipoBeca !== 'Ninguna' ? ` (${s.tipoBeca})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
                        <select 
                            className="w-full mt-1 border p-2 rounded"
                            value={paymentType}
                            onChange={e => setPaymentType(e.target.value as PaymentType)}
                        >
                            {Object.values(PaymentType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Monto Base Anual (Bs)</label>
                        <input 
                            type="number" 
                            className="w-full mt-1 border p-2 rounded" 
                            value={annualAmount}
                            onChange={e => setAnnualAmount(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <label className="block text-xs font-bold text-yellow-800 uppercase mb-1 flex items-center">
                        <Calculator size={12} className="mr-1"/> Descuento (%)
                    </label>
                    <div className="flex items-center">
                        <input 
                            type="number" 
                            className="w-20 border p-1 rounded mr-2"
                            value={discountPercent}
                            onChange={e => setDiscountPercent(Number(e.target.value))}
                            min="0" max="100"
                        />
                        <span className="text-sm text-gray-600">
                            Monto Final: <strong>{calculateTotal(annualAmount, discountPercent).toFixed(2)} Bs</strong>
                        </span>
                    </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
                    Cuota estimada: <strong>{calculateInstallment(annualAmount, discountPercent, paymentType).toFixed(2)} Bs.</strong>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Firma</label>
                    <input 
                        type="date" 
                        className="w-full mt-1 border p-2 rounded"
                        value={contractDate}
                        onChange={e => setContractDate(e.target.value)} 
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <Save size={18} className="mr-2" /> Generar Contrato
                </button>
            </div>
          </div>
        </div>
      )}

      {viewContractId && (
        <ContractDocument 
            db={db} 
            contractId={viewContractId} 
            onClose={() => setViewContractId(null)} 
        />
      )}
    </div>
  );
};