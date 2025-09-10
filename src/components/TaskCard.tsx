import { memo, useMemo, useCallback } from 'react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  Clock, 
  User, 
  Calendar, 
  Flag, 
  Play, 
  CheckCircle, 
  Pause,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

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

interface TaskCardProps {
  task: Task;
  personnel: Personnel[];
  onStatusChange: (taskId: string, newStatus: 'pending' | 'active' | 'completed') => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewDetails: (task: Task) => void;
}

// Status configurations outside component to avoid recreation
const STATUS_CONFIGS = {
  pending: { variant: 'secondary' as const, label: 'Pendiente', icon: Clock },
  active: { variant: 'default' as const, label: 'Activa', icon: Play },
  completed: { variant: 'secondary' as const, label: 'Completada', icon: CheckCircle }
};

const STATUS_CLASSES = {
  pending: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
  active: 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white',
  completed: 'bg-green-500 text-white dark:bg-green-600 dark:text-white'
};

const PRIORITY_CONFIGS = {
  low: { className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600', label: 'Baja' },
  medium: { className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700', label: 'Media' },
  high: { className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700', label: 'Alta' },
  urgent: { className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700', label: 'Urgente' }
};

export const TaskCard = memo(function TaskCard({ task, personnel, onStatusChange, onEdit, onDelete, onViewDetails }: TaskCardProps) {
  // Memoize assigned personnel to avoid recalculation
  const assignedPersonnel = useMemo(() => {
    return task.assignedTo.map(id => 
      personnel.find(p => p.id === id)
    ).filter(Boolean) as Personnel[];
  }, [task.assignedTo, personnel]);

  // Memoize date formatter
  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  // Memoize time info
  const timeInfo = useMemo(() => {
    if (task.status === 'completed' && task.completedAt) {
      return `Completada: ${formatDate(task.completedAt)}`;
    }
    if (task.status === 'active' && task.activatedAt) {
      return `Iniciada: ${formatDate(task.activatedAt)}`;
    }
    return `Creada: ${formatDate(task.createdAt)}`;
  }, [task.status, task.completedAt, task.activatedAt, task.createdAt, formatDate]);

  // Memoize duration info
  const durationInfo = useMemo(() => {
    if (task.status === 'completed' && task.activatedAt && task.completedAt) {
      const durationMs = task.completedAt.getTime() - task.activatedAt.getTime();
      const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
      return `${durationHours}h completada`;
    }
    
    if (task.status === 'active' && task.activatedAt) {
      const now = Date.now();
      const elapsedMs = now - task.activatedAt.getTime();
      const elapsedHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
      return `${elapsedHours}h transcurridas`;
    }
    
    return `${task.estimatedHours}h estimadas`;
  }, [task.status, task.activatedAt, task.completedAt, task.estimatedHours]);

  // Status badge component
  const StatusBadge = useMemo(() => {
    const config = STATUS_CONFIGS[task.status];
    const Icon = config.icon;
    const className = STATUS_CLASSES[task.status];
    
    return (
      <Badge 
        variant={task.status === 'pending' ? 'outline' : 'default'} 
        className={className}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }, [task.status]);

  // Priority badge component
  const PriorityBadge = useMemo(() => {
    const config = PRIORITY_CONFIGS[task.priority];
    
    return (
      <Badge variant="outline" className={config.className}>
        <Flag className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }, [task.priority]);

  // Action handlers
  const handleStatusChange = useCallback((e: React.MouseEvent, newStatus: 'pending' | 'active' | 'completed') => {
    e.stopPropagation();
    onStatusChange(task.id, newStatus);
  }, [onStatusChange, task.id]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  }, [onEdit, task]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.')) {
      onDelete(task.id);
    }
  }, [onDelete, task.id]);

  const handleViewDetails = useCallback(() => {
    onViewDetails(task);
  }, [onViewDetails, task]);

  const canActivate = task.status === 'pending';
  const canComplete = task.status === 'active';
  const canPause = task.status === 'active';

  return (
    <Card 
      className="p-6 transition-all duration-300 cursor-pointer group 
                 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                 border border-gray-200 dark:border-slate-600
                 shadow-md hover:shadow-xl dark:shadow-slate-900/20
                 hover:scale-[1.02] hover:-translate-y-1
                 dark:shadow-2xl dark:shadow-slate-900/40
                 dark:ring-1 dark:ring-slate-700/50
                 dark:hover:ring-slate-600/60 dark:hover:shadow-slate-900/60
                 relative overflow-hidden
                 before:absolute before:inset-0 before:bg-gradient-to-r 
                 before:from-transparent before:via-white/5 before:to-transparent
                 before:translate-x-[-100%] before:hover:translate-x-[100%]
                 before:transition-transform before:duration-1000 before:ease-out
                 dark:before:block before:hidden"
      onClick={handleViewDetails}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold leading-none tracking-tight">{task.title}</h3>
            <p className="text-muted-foreground line-clamp-2">{task.description}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          {StatusBadge}
          {PriorityBadge}
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
            {task.category}
          </Badge>
        </div>

        {/* Assigned Personnel */}
        {assignedPersonnel.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              {assignedPersonnel.slice(0, 3).map((person) => (
                <div key={person.id} className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{person.name}</span>
                </div>
              ))}
              {assignedPersonnel.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{assignedPersonnel.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Time Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {timeInfo}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {durationInfo}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {canActivate && (
            <Button 
              size="sm" 
              onClick={(e) => handleStatusChange(e, 'active')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Play className="w-4 h-4 mr-1" />
              Iniciar
            </Button>
          )}
          
          {canComplete && (
            <Button 
              size="sm" 
              onClick={(e) => handleStatusChange(e, 'completed')}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Completar
            </Button>
          )}
          
          {canPause && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => handleStatusChange(e, 'pending')}
            >
              <Pause className="w-4 h-4 mr-1" />
              Pausar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});