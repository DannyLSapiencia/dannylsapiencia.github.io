import { Database } from '../types';

export const generateSqlDump = (db: Database): string => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  let sql = `-- Database Export for Gestor Escolar Pro\n`;
  sql += `-- Generated: ${timestamp}\n`;
  sql += `-- DBAdmin User Export\n\n`;

  // Create Tables
  sql += `CREATE TABLE IF NOT EXISTS padres (\n`;
  sql += `  id VARCHAR(36) PRIMARY KEY,\n`;
  sql += `  ci VARCHAR(20) NOT NULL UNIQUE,\n`;
  sql += `  primer_apellido VARCHAR(100) NOT NULL,\n`;
  sql += `  segundo_apellido VARCHAR(100),\n`;
  sql += `  nombres VARCHAR(100) NOT NULL,\n`;
  sql += `  celular VARCHAR(20),\n`;
  sql += `  celular2 VARCHAR(20),\n`;
  sql += `  direccion TEXT\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS estudiantes (\n`;
  sql += `  id VARCHAR(36) PRIMARY KEY,\n`;
  sql += `  ci VARCHAR(20) NOT NULL UNIQUE,\n`;
  sql += `  rude VARCHAR(50),\n`;
  sql += `  primer_apellido VARCHAR(100) NOT NULL,\n`;
  sql += `  segundo_apellido VARCHAR(100),\n`;
  sql += `  nombres VARCHAR(100) NOT NULL,\n`;
  sql += `  curso VARCHAR(50),\n`;
  sql += `  celular VARCHAR(20),\n`;
  sql += `  id_padre VARCHAR(20) NOT NULL,\n`;
  sql += `  es_distancia BOOLEAN DEFAULT FALSE,\n`;
  sql += `  tipo_beca VARCHAR(50),\n`;
  sql += `  FOREIGN KEY (id_padre) REFERENCES padres(ci)\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS contratos (\n`;
  sql += `  id VARCHAR(36) PRIMARY KEY,\n`;
  sql += `  numero_contrato VARCHAR(50) NOT NULL,\n`;
  sql += `  id_padre VARCHAR(20) NOT NULL,\n`;
  sql += `  id_estudiante VARCHAR(20) NOT NULL,\n`;
  sql += `  tipo_pago VARCHAR(50),\n`;
  sql += `  monto_anual DECIMAL(10, 2),\n`;
  sql += `  descuento DECIMAL(5, 2) DEFAULT 0,\n`;
  sql += `  monto_cuota DECIMAL(10, 2),\n`;
  sql += `  fecha_firma DATE,\n`;
  sql += `  FOREIGN KEY (id_padre) REFERENCES padres(ci),\n`;
  sql += `  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(ci)\n`;
  sql += `);\n\n`;

  // Insert Parents
  if (db.parents.length > 0) {
    sql += `INSERT INTO padres (id, ci, primer_apellido, segundo_apellido, nombres, celular, celular2, direccion) VALUES\n`;
    sql += db.parents.map(p => {
        return `('${p.id}', '${p.ci}', '${p.primerApellido}', '${p.segundoApellido}', '${p.nombres}', '${p.celular}', '${p.celular2 || ''}', '${p.direccion}')`;
    }).join(',\n') + ';\n\n';
  }

  // Insert Students
  if (db.students.length > 0) {
    sql += `INSERT INTO estudiantes (id, ci, rude, primer_apellido, segundo_apellido, nombres, curso, celular, id_padre, es_distancia, tipo_beca) VALUES\n`;
    sql += db.students.map(s => {
        const esDistancia = s.esDistancia ? 1 : 0;
        return `('${s.id}', '${s.ci}', '${s.rude}', '${s.primerApellido}', '${s.segundoApellido}', '${s.nombres}', '${s.curso}', '${s.celular || ''}', '${s.idPadre}', ${esDistancia}, '${s.tipoBeca || 'Ninguna'}')`;
    }).join(',\n') + ';\n\n';
  }

  // Insert Contracts
  if (db.contracts.length > 0) {
    sql += `INSERT INTO contratos (id, numero_contrato, id_padre, id_estudiante, tipo_pago, monto_anual, descuento, monto_cuota, fecha_firma) VALUES\n`;
    sql += db.contracts.map(c => {
        return `('${c.id}', '${c.numeroContrato}', '${c.idPadre}', '${c.idEstudiante}', '${c.tipoPago}', ${c.montoAnual}, ${c.descuento || 0}, ${c.montoCuota}, '${c.fechaFirma}')`;
    }).join(',\n') + ';\n';
  }

  return sql;
};