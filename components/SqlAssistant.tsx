import React, { useState } from 'react';
import { Database } from '../types';
import { askDatabaseAssistant } from '../services/gemini';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface Props {
  db: Database;
}

export const SqlAssistant: React.FC<Props> = ({ db }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    const answer = await askDatabaseAssistant(db, query);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg shadow-lg p-6 text-white mb-6">
      <div className="flex items-center mb-4">
        <Sparkles className="mr-2 text-yellow-300" />
        <h2 className="text-lg font-bold">Asistente Inteligente (Gemini)</h2>
      </div>
      <p className="text-indigo-100 text-sm mb-4">
        Pregunta en lenguaje natural sobre la base de datos. Ej: "¿Qué estudiantes pagan mensualidad?", "¿Quién es el padre de Juan?"
      </p>

      <form onSubmit={handleAsk} className="relative">
        <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu consulta aquí..."
            className="w-full p-3 pr-12 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />
        <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 p-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>

      {response && (
        <div className="mt-4 bg-white/10 p-4 rounded-lg border border-white/20">
            <h4 className="text-xs uppercase tracking-wider text-indigo-200 mb-1">Respuesta:</h4>
            <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};