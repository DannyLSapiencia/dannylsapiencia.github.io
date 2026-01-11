import { GoogleGenAI } from "@google/genai";
import { Database } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const askDatabaseAssistant = async (db: Database, question: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Prepare context
    const context = `
      Actúa como un experto en SQL y administración de datos escolares.
      Tienes acceso a una base de datos en formato JSON con la siguiente estructura:
      
      Parents (Padres): ${JSON.stringify(db.parents.map(p => ({ ci: p.ci, nombre: `${p.nombres} ${p.primerApellido}` })))}
      Students (Estudiantes): ${JSON.stringify(db.students.map(s => ({ ci: s.ci, nombre: `${s.nombres} ${s.primerApellido}`, curso: s.curso, idPadre: s.idPadre })))}
      Contracts (Contratos): ${JSON.stringify(db.contracts.map(c => ({ num: c.numeroContrato, tipo: c.tipoPago, monto: c.montoAnual, padre: c.idPadre, estudiante: c.idEstudiante })))}

      Responde a la siguiente pregunta del usuario de forma concisa. Si te piden una consulta, explica qué datos se relacionan.
      Si te piden buscar algo específico (ej: "Quién es el padre de Juan"), búscalo en los datos proporcionados y responde directamente.
      
      Pregunta del usuario: "${question}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con el asistente de IA. Verifica tu API Key.";
  }
};