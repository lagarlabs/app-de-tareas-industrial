import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { X, Plus } from "lucide-react";

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

interface TaskFormProps {
  task?: Task;
  personnel: Personnel[];
  categories: string[];
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'activatedAt' | 'completedAt'>) => void;
  onCancel: () => void;
}

export function TaskForm({ task, personnel, categories, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium' as const,
    assignedTo: task?.assignedTo || [],
    estimatedHours: task?.estimatedHours || 1,
    category: task?.category || categories[0] || '',
    status: task?.status || 'pending' as const
  });

  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryToUse = showNewCategory && newCategory.trim() 
      ? newCategory.trim() 
      : formData.category;

    onSubmit({
      ...formData,
      category: categoryToUse
    });
  };

  const handlePersonnelToggle = (personnelId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: checked 
        ? [...prev.assignedTo, personnelId]
        : prev.assignedTo.filter(id => id !== personnelId)
    }));
  };

  const availableCategories = showNewCategory ? categories : [...categories];

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nombre de la tarea"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe la tarea en detalle..."
              rows={3}
            />
          </div>

          {/* Priority and Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categoría</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva
                </Button>
              </div>
              
              {showNewCategory ? (
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nueva categoría"
                />
              ) : (
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-2">
            <Label htmlFor="hours">Horas Estimadas</Label>
            <Input
              id="hours"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.estimatedHours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
            />
          </div>

          {/* Personnel Assignment */}
          <div className="space-y-3">
            <Label>Asignar Personal</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
              {personnel.filter(p => p.active).map(person => (
                <div key={person.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={person.id}
                    checked={formData.assignedTo.includes(person.id)}
                    onCheckedChange={(checked) => handlePersonnelToggle(person.id, checked as boolean)}
                  />
                  <Label htmlFor={person.id} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.role} - {person.department}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {task ? 'Actualizar' : 'Crear'} Tarea
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}