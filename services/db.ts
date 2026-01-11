import { Database, Student, Parent, Contract } from '../types';

const DB_KEY = 'school_db_v1';

// Este objeto representa el "Documento de Base de Datos" inicial.
// Puedes reemplazar este contenido con un JSON exportado para inicializar la app con datos en tu repositorio.
const initialData: Database = {
  parents: [],
  students: [],
  contracts: []
};

export const loadDB = (): Database => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initialData;
  } catch (e) {
    console.error("Error loading DB", e);
    return initialData;
  }
};

export const saveDB = (db: Database) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Error saving DB", e);
  }
};

export const validateDB = (data: any): data is Database => {
  if (!data || typeof data !== 'object') return false;
  
  // Basic structural check
  const hasParents = Array.isArray(data.parents);
  const hasStudents = Array.isArray(data.students);
  const hasContracts = Array.isArray(data.contracts);

  return hasParents && hasStudents && hasContracts;
};

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Relational Helpers
export const getParentByCI = (db: Database, ci: string) => db.parents.find(p => p.ci === ci);
export const getStudentByCI = (db: Database, ci: string) => db.students.find(s => s.ci === ci);
export const getStudentsByParent = (db: Database, parentCI: string) => db.students.filter(s => s.idPadre === parentCI);
export const getContractsByParent = (db: Database, parentCI: string) => db.contracts.filter(c => c.idPadre === parentCI);

export const getContractFullDetails = (db: Database, contractId: string) => {
  const contract = db.contracts.find(c => c.id === contractId);
  if (!contract) return null;
  const parent = getParentByCI(db, contract.idPadre);
  const student = getStudentByCI(db, contract.idEstudiante);
  return { contract, parent, student };
};