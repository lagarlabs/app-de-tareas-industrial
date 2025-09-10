import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Plus, Users, Building, UserCheck, UserX } from "lucide-react";

interface Personnel {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  active: boolean;
}

interface PersonnelManagerProps {
  personnel: Personnel[];
  onPersonnelUpdate: (updated: Personnel[]) => void;
}

export function PersonnelManager({ personnel, onPersonnelUpdate }: PersonnelManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    role: '',
    department: '',
    active: true
  });

  const departments = [...new Set(personnel.map(p => p.department))];
  const activePeople = personnel.filter(p => p.active).length;
  const inactivePeople = personnel.filter(p => !p.active).length;

  const handleAddPerson = () => {
    if (!newPerson.name.trim() || !newPerson.role.trim() || !newPerson.department.trim()) {
      return;
    }

    const person: Personnel = {
      id: crypto.randomUUID(),
      ...newPerson
    };

    onPersonnelUpdate([...personnel, person]);
    setNewPerson({ name: '', role: '', department: '', active: true });
    setShowAddForm(false);
  };

  const handleToggleActive = (personId: string) => {
    const updated = personnel.map(p => 
      p.id === personId ? { ...p, active: !p.active } : p
    );
    onPersonnelUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Gestión de Personal</h2>
          <p className="text-muted-foreground">
            Administra el equipo y asignaciones
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Personal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Total Personal</p>
              <p className="text-xl font-semibold">{personnel.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-muted-foreground">Activos</p>
              <p className="text-xl font-semibold">{activePeople}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-muted-foreground">Departamentos</p>
              <p className="text-xl font-semibold">{departments.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="mb-4">Agregar Nuevo Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Nombre completo"
              value={newPerson.name}
              onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Rol/Puesto"
              value={newPerson.role}
              onChange={(e) => setNewPerson(prev => ({ ...prev, role: e.target.value }))}
            />
            <Select 
              value={newPerson.department} 
              onValueChange={(value) => setNewPerson(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
                <SelectItem value="Nuevo Departamento">+ Nuevo Departamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {newPerson.department === "Nuevo Departamento" && (
            <Input
              className="mt-4"
              placeholder="Nombre del nuevo departamento"
              onChange={(e) => setNewPerson(prev => ({ ...prev, department: e.target.value }))}
            />
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPerson}>
              Agregar
            </Button>
          </div>
        </Card>
      )}

      {/* Personnel List */}
      <div className="space-y-4">
        {departments.map(department => {
          const departmentPersonnel = personnel.filter(p => p.department === department);
          
          return (
            <Card key={department} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>{department}</h3>
                <Badge variant="secondary">
                  {departmentPersonnel.length} persona{departmentPersonnel.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {departmentPersonnel.map(person => (
                  <div key={person.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">{person.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={person.active ? "default" : "secondary"}
                        className={person.active ? "bg-green-500" : ""}
                      >
                        {person.active ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${person.id}`} className="text-sm">
                          {person.active ? 'Activo' : 'Inactivo'}
                        </Label>
                        <Switch
                          id={`active-${person.id}`}
                          checked={person.active}
                          onCheckedChange={() => handleToggleActive(person.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}