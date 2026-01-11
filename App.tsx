import React, { useState, useEffect } from 'react';
import { Database } from './types';
import { loadDB, saveDB } from './services/db';
import { StudentList } from './components/StudentList';
import { ParentList } from './components/ParentList';
import { ContractList } from './components/ContractList';
import { SqlAssistant } from './components/SqlAssistant';
import { DbAdmin } from './components/DbAdmin';
import { Reports } from './components/Reports';
import { LayoutDashboard, Users, GraduationCap, FileText, Menu, X, Database as DbIcon, PieChart } from 'lucide-react';

const App: React.FC = () => {
  const [db, setDb] = useState<Database>({ parents: [], students: [], contracts: [] });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'parents' | 'students' | 'contracts' | 'reports' | 'db_admin'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const data = loadDB();
    setDb(data);
  }, []);

  const handleUpdateDb = (newDb: Database) => {
    setDb(newDb);
    saveDB(newDb);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'parents', label: 'Padres', icon: Users },
    { id: 'students', label: 'Estudiantes', icon: GraduationCap },
    { id: 'contracts', label: 'Contratos', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: PieChart },
    { id: 'db_admin', label: 'Base de Datos', icon: DbIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
        case 'parents': return <ParentList db={db} updateDb={handleUpdateDb} />;
        case 'students': return <StudentList db={db} updateDb={handleUpdateDb} />;
        case 'contracts': return <ContractList db={db} updateDb={handleUpdateDb} />;
        case 'reports': return <Reports db={db} />;
        case 'db_admin': return <DbAdmin db={db} />;
        default:
            return (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Estudiantes</p>
                                    <h3 className="text-3xl font-bold">{db.students.length}</h3>
                                </div>
                                <GraduationCap className="text-blue-200" size={40} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Padres Registrados</p>
                                    <h3 className="text-3xl font-bold">{db.parents.length}</h3>
                                </div>
                                <Users className="text-green-200" size={40} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Contratos Activos</p>
                                    <h3 className="text-3xl font-bold">{db.contracts.length}</h3>
                                </div>
                                <FileText className="text-purple-200" size={40} />
                            </div>
                        </div>
                    </div>
                    
                    <SqlAssistant db={db} />

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Acceso Rápido</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setActiveTab('parents')} className="p-4 border rounded hover:bg-gray-50 text-left">
                                <span className="font-bold block">Registrar Nuevo Padre</span>
                                <span className="text-sm text-gray-500">Paso 1 del proceso de inscripción</span>
                            </button>
                            <button onClick={() => setActiveTab('students')} className="p-4 border rounded hover:bg-gray-50 text-left">
                                <span className="font-bold block">Inscribir Estudiante</span>
                                <span className="text-sm text-gray-500">Paso 2: Vincular al padre</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col fixed h-full z-10 md:relative`}>
        <div className="p-6 border-b border-gray-100 flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">GE</div>
            <h1 className="font-bold text-gray-800 text-lg">Gestor Escolar</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as any); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Icon size={20} className="mr-3" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                )
            })}
        </nav>
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700">
                {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Administrador</span>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-6 relative">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;