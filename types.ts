export enum PaymentType {
  GLOBAL = 'Global',
  SEMESTRAL = 'Semestral',
  TRIMESTRAL = 'Trimestral',
  MENSUAL = 'Mensual'
}

export interface Parent {
  id: string;
  ci: string; // Key
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  celular: string;
  celular2?: string;
  direccion: string;
}

export interface Student {
  id: string;
  ci: string; // Key
  rude: string;
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  curso: string;
  celular?: string;
  idPadre: string; // FK to Parent.ci
  esDistancia: boolean; // New field
  tipoBeca: string; // 'Ninguna', 'Beca Social', 'Descuento Hnos', etc.
}

export interface Contract {
  id: string;
  numeroContrato: string;
  idPadre: string; // FK to Parent.ci
  idEstudiante: string; // FK to Student.ci
  tipoPago: PaymentType;
  montoAnual: number;
  descuento: number; // New field (percentage or fixed amount)
  montoCuota: number;
  fechaFirma: string;
}

export interface Database {
  parents: Parent[];
  students: Student[];
  contracts: Contract[];
}