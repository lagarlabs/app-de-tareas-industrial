import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { 
  Clock, 
  User, 
  Calendar, 
  Flag, 
  Play, 
  CheckCircle, 
  Pause,
  Edit,
  Target,
  FileText,
  Users,
  Timer,
  Activity,
  Trash2
} from "lucide-react";

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

interface TaskDetailProps {
  task: Task | null;
  personnel: Personnel[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: 'pending' | 'active' | 'completed') => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetail({ task, personnel, isOpen, onClose, onStatusChange, onEdit, onDelete }: TaskDetailProps) {
  if (!task) return null;

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { 
        variant: 'secondary' as const, 
        label: 'Pendiente', 
        icon: Clock,
        className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      },
      active: { 
        variant: 'default' as const, 
        label: 'Activa', 
        icon: Activity,
        className: 'bg-blue-500 text-white dark:bg-blue-600'
      },
      completed: { 
        variant: 'secondary' as const, 
        label: 'Completada', 
        icon: CheckCircle,
        className: 'bg-green-500 text-white dark:bg-green-600'
      }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      low: { className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300', label: 'Baja' },
      medium: { className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Media' },
      high: { className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400', label: 'Alta' },
      urgent: { className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400', label: 'Urgente' }
    };
    
    const config = configs[priority as keyof typeof configs];
    
    return (
      <Badge variant="outline" className={config.className}>
        <Flag className="w-4 h-4 mr-2" />
        {config.label}
      </Badge>
    );
  };

  const getAssignedPersonnel = () => {
    return task.assignedTo.map(id => 
      personnel.find(p => p.id === id)
    ).filter(Boolean) as Personnel[];
  };

  const formatDetailedDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateDuration = () => {
    if (task.status === 'completed' && task.activatedAt && task.completedAt) {
      const duration = task.completedAt.getTime() - task.activatedAt.getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    if (task.status === 'active' && task.activatedAt) {
      const duration = new Date().getTime() - task.activatedAt.getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m (en curso)`;
    }
    return null;
  };

  const canActivate = task.status === 'pending';
  const canComplete = task.status === 'active';
  const canPause = task.status === 'active';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !w-[90vw] !h-[70vh] !min-w-[90vw] !min-h-[70vh] overflow-hidden
                                      bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                                      border border-gray-200 dark:border-slate-600
                                      shadow-2xl dark:shadow-slate-900/40
                                      dark:ring-1 dark:ring-slate-700/50
                                      p-0 !aspect-[16/9] rounded-2xl">
        {/* Elementos de accesibilidad ocultos visualmente */}
        <div className="sr-only">
          <DialogTitle>{task.title} - Detalles de la Tarea</DialogTitle>
          <DialogDescription>
            Detalles completos de la tarea incluyendo cronología, personal asignado y controles de estado.
          </DialogDescription>
        </div>
        {/* Layout Horizontal Completo */}
        <div className="flex flex-col h-full">
          {/* Header Compacto */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 bg-gradient-to-r from-background to-muted/30 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <p className="text-sm text-muted-foreground">ID: {task.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
                {task.category}
              </Badge>
            </div>
          </div>

          {/* Contenido Principal Horizontal */}
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="grid grid-cols-5 h-full gap-0">
              
              {/* Columna 1: Descripción y Detalles (2/5) */}
              <div className="col-span-2 p-4 border-r dark:border-slate-700 space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Descripción de la Tarea</h3>
                  </div>
                  <div className="bg-muted/50 dark:bg-slate-800/50 rounded-lg p-4 border dark:border-slate-700 min-h-[120px]">
                    <p className="text-muted-foreground leading-relaxed">
                      {task.description || 'Sin descripción disponible'}
                    </p>
                  </div>
                </div>

                {/* Métricas de Tiempo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Métricas de Tiempo</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border dark:border-blue-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Tiempo Estimado</span>
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{task.estimatedHours}h</p>
                    </div>

                    {calculateDuration() && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border dark:border-green-800/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Tiempo Transcurrido</span>
                          <Activity className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xl font-bold text-green-800 dark:text-green-200">{calculateDuration()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna 2: Timeline Horizontal (2/5) */}
              <div className="col-span-2 p-4 border-r dark:border-slate-700 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Cronología Completa</h3>
                </div>
                
                {/* Timeline Horizontal */}
                <div className="space-y-3">
                  {/* Created */}
                  <div className="bg-card dark:bg-slate-800/50 rounded-lg p-3 border dark:border-slate-700 relative">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-base">📝</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-600 dark:text-gray-300">Tarea Creada</p>
                        <p className="text-sm text-muted-foreground mt-1">{formatDetailedDate(task.createdAt)}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                          <div className="bg-gray-400 h-1 rounded-full w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activated */}
                  {task.activatedAt && (
                    <div className="bg-card dark:bg-slate-800/50 rounded-lg p-3 border dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-base">🚀</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-600 dark:text-blue-400">Tarea Iniciada</p>
                          <p className="text-sm text-muted-foreground mt-1">{formatDetailedDate(task.activatedAt)}</p>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1 mt-2">
                            <div className="bg-blue-500 h-1 rounded-full w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {task.completedAt && (
                    <div className="bg-card dark:bg-slate-800/50 rounded-lg p-3 border dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-base">✅</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-600 dark:text-green-400">Tarea Completada</p>
                          <p className="text-sm text-muted-foreground mt-1">{formatDetailedDate(task.completedAt)}</p>
                          <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1 mt-2">
                            <div className="bg-green-500 h-1 rounded-full w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna 3: Personal Asignado (1/5) */}
              <div className="col-span-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Personal</h3>
                </div>
                
                {getAssignedPersonnel().length > 0 ? (
                  <div className="space-y-3">
                    {getAssignedPersonnel().map((person) => (
                      <div key={person.id} className="bg-card dark:bg-slate-800/50 rounded-lg p-3 border dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{person.name}</p>
                            </div>
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="text-muted-foreground">{person.role}</p>
                            <p className="text-muted-foreground">{person.department}</p>
                            <Badge variant={person.active ? "default" : "secondary"} className="text-xs">
                              {person.active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 dark:bg-slate-800/30 rounded-lg p-4 text-center border dark:border-slate-700">
                    <Users className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Sin personal asignado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-between p-4 border-t dark:border-slate-700 bg-gradient-to-r from-background to-muted/30 shrink-0">
            <div className="text-sm text-muted-foreground">
              Creada el {formatDetailedDate(task.createdAt).split(',')[0]}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onEdit(task)} className="hover:bg-muted/50">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              
              {canActivate && (
                <Button 
                  onClick={() => {
                    onStatusChange(task.id, 'active');
                    onClose();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Tarea
                </Button>
              )}
              
              {canPause && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    onStatusChange(task.id, 'pending');
                    onClose();
                  }}
                  className="hover:bg-yellow-50 hover:border-yellow-300 dark:hover:bg-yellow-900/20"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
              )}
              
              {canComplete && (
                <Button 
                  onClick={() => {
                    onStatusChange(task.id, 'completed');
                    onClose();
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}