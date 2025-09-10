import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { PersonnelManager } from './components/PersonnelManager';
import { Dashboard } from './components/Dashboard';
import { TaskDetail } from './components/TaskDetail';
import { ThemeToggle } from './components/ThemeToggle';
import { Plus, LayoutDashboard, CheckSquare, Users } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  createdAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  estimatedHours: number;
  category: string;
}

interface Personnel {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  active: boolean;
}

// Mock data
const initialPersonnel: Personnel[] = [
  { id: '1', name: 'Carlos Méndez', role: 'Supervisor', department: 'Producción', active: true },
  { id: '2', name: 'Ana García', role: 'Técnico', department: 'Mantenimiento', active: true },
  { id: '3', name: 'Luis Rodríguez', role: 'Operador', department: 'Producción', active: true },
  { id: '4', name: 'María López', role: 'Ingeniera', department: 'Calidad', active: true },
  { id: '5', name: 'Pedro Sánchez', role: 'Técnico', department: 'Mantenimiento', active: false },
  { id: '6', name: 'Carmen Vega', role: 'Analista', department: 'Calidad', active: true },
];

const initialTasks: Task[] = [
  {
    id: '2',
    title: 'Calibración de Equipos de Medición',
    description: 'Calibración trimestral de todos los instrumentos de medición en el área de calidad',
    status: 'pending',
    priority: 'medium',
    assignedTo: ['4', '6'],
    createdAt: new Date(2025, 0, 9, 7, 0), // 9 enero 2025
    estimatedHours: 6,
    category: 'Calidad'
  },
  {
    id: '3',
    title: 'Mantenimiento Preventivo Compresor Principal',
    description: 'Cambio de filtros, revisión de presiones y lubricación del compresor central',
    status: 'completed',
    priority: 'urgent',
    assignedTo: ['2'],
    createdAt: new Date(2025, 0, 7, 6, 0), // 7 enero 2025
    activatedAt: new Date(2025, 0, 7, 8, 0), // Iniciada 2h después
    completedAt: new Date(2025, 0, 7, 12, 30), // Completada en 4.5h
    estimatedHours: 3,
    category: 'Mantenimiento'
  },
  {
    id: '4',
    title: 'Capacitación en Seguridad Industrial',
    description: 'Sesión mensual de capacitación en procedimientos de seguridad para nuevos empleados',
    status: 'pending',
    priority: 'medium',
    assignedTo: ['1'],
    createdAt: new Date(2025, 0, 10, 14, 0), // 10 enero 2025
    estimatedHours: 2,
    category: 'Seguridad'
  },
  {
    id: '6',
    title: 'Revisión Sistema Eléctrico',
    description: 'Inspección y pruebas del sistema eléctrico principal de la planta',
    status: 'completed',
    priority: 'high',
    assignedTo: ['2', '5'],
    createdAt: new Date(2025, 0, 5, 9, 0), // 5 enero 2025
    activatedAt: new Date(2025, 0, 5, 10, 0), // Iniciada 1h después
    completedAt: new Date(2025, 0, 6, 2, 0), // Completada en 16h
    estimatedHours: 12,
    category: 'Mantenimiento'
  },
  {
    id: '7',
    title: 'Control de Calidad Lote 2025-001',
    description: 'Análisis y verificación del primer lote de producción del año',
    status: 'completed',
    priority: 'medium',
    assignedTo: ['4'],
    createdAt: new Date(2025, 0, 4, 7, 0), // 4 enero 2025
    activatedAt: new Date(2025, 0, 4, 8, 30), // Iniciada 1.5h después
    completedAt: new Date(2025, 0, 4, 16, 45), // Completada en 8.25h
    estimatedHours: 6,
    category: 'Calidad'
  }
];

const initialCategories = ['Mantenimiento', 'Calidad', 'Seguridad', 'Logística', 'Producción'];

// Helper function for generating IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [personnelFilter, setPersonnelFilter] = useState('all');

  // Filter tasks with optimized search
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    
    const searchLower = searchTerm.toLowerCase();
    
    return tasks.filter(task => {
      // Search filter - only compute if searchTerm exists
      if (searchTerm && !(
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      )) {
        return false;
      }

      // Simple equality checks
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      
      // Personnel filter
      if (personnelFilter !== 'all') {
        if (personnelFilter === 'unassigned' && task.assignedTo.length > 0) return false;
        if (personnelFilter !== 'unassigned' && !task.assignedTo.includes(personnelFilter)) return false;
      }

      return true;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, personnelFilter]);

  const activeFiltersCount = [
    statusFilter !== 'all',
    priorityFilter !== 'all', 
    categoryFilter !== 'all',
    personnelFilter !== 'all'
  ].filter(Boolean).length;

  const handleTaskSubmit = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'activatedAt' | 'completedAt'>) => {
    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
    } else {
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: new Date()
      };
      setTasks(prev => [...prev, newTask]);
    }

    // Add new category if it doesn't exist
    if (!categories.includes(taskData.category)) {
      setCategories(prev => [...prev, taskData.category]);
    }

    setShowTaskForm(false);
    setEditingTask(undefined);
  }, [editingTask, categories]);

  const handleStatusChange = useCallback((taskId: string, newStatus: 'pending' | 'active' | 'completed') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const now = new Date();
        const updates: Partial<Task> = { status: newStatus };
        
        if (newStatus === 'active' && task.status === 'pending') {
          updates.activatedAt = now;
        } else if (newStatus === 'completed') {
          updates.completedAt = now;
        } else if (newStatus === 'pending' && task.status === 'active') {
          updates.activatedAt = undefined;
        }
        
        return { ...task, ...updates };
      }
      return task;
    }));
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
    setShowTaskDetail(false);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    // Close detail modal if the deleted task was being viewed
    if (selectedTask?.id === taskId) {
      setShowTaskDetail(false);
      setSelectedTask(null);
    }
  }, [selectedTask?.id]);

  const handleViewTaskDetails = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setPersonnelFilter('all');
    setSearchTerm('');
  }, []);

  if (showTaskForm) {
    return (
      <div className="min-h-screen bg-background p-4">
        <TaskForm
          task={editingTask}
          personnel={personnel}
          categories={categories}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 lg:grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="personnel" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Personal
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {activeTab === 'tasks' && (
                <Button onClick={() => setShowTaskForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard tasks={tasks} personnel={personnel} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              personnelFilter={personnelFilter}
              onPersonnelFilterChange={setPersonnelFilter}
              categories={categories}
              personnel={personnel}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  personnel={personnel}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onViewDetails={handleViewTaskDetails}
                />
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-muted-foreground">No se encontraron tareas</h3>
                <p className="text-muted-foreground">
                  {searchTerm || activeFiltersCount > 0 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Comienza creando tu primera tarea'
                  }
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            <PersonnelManager
              personnel={personnel}
              onPersonnelUpdate={setPersonnel}
            />
          </TabsContent>
        </Tabs>

        {/* Task Detail Modal */}
        <TaskDetail
          task={selectedTask}
          personnel={personnel}
          isOpen={showTaskDetail}
          onClose={() => setShowTaskDetail(false)}
          onStatusChange={handleStatusChange}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
}