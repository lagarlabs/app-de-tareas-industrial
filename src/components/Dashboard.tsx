import { memo, useMemo } from 'react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Users, CheckCircle, AlertCircle, TrendingUp, Activity, Target, Calendar, Timer, Award, BarChart3, PieChart, LineChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, Area, AreaChart } from "recharts";

interface DashboardProps {
  tasks: Task[];
  personnel: Personnel[];
}

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

export const Dashboard = memo(function Dashboard({ tasks, personnel }: DashboardProps) {
  // Memoize calculations
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const activePersonnel = personnel.filter(p => p.active).length;
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      pendingTasks,
      activeTasks,
      completedTasks,
      activePersonnel,
      urgentTasks,
      completionRate
    };
  }, [tasks, personnel]);

  // Memoize chart data
  const chartData = useMemo(() => {
    const statusChartData = [
      { name: 'Pendientes', value: stats.pendingTasks, fill: 'hsl(var(--chart-1))' },
      { name: 'Activas', value: stats.activeTasks, fill: 'hsl(var(--chart-2))' },
      { name: 'Completadas', value: stats.completedTasks, fill: 'hsl(var(--chart-3))' }
    ];

    const departmentData = Object.entries(
      personnel.reduce((acc, person) => {
        acc[person.department] = (acc[person.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([department, count], index) => ({
      department: department.slice(0, 10),
      count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }));

    // Simplified weekly data (mock for demo)
    const weeklyData = [
      { day: 'Lun', completed: 8, created: 12 },
      { day: 'Mar', completed: 6, created: 9 },
      { day: 'Mié', completed: 10, created: 8 },
      { day: 'Jue', completed: 7, created: 11 },
      { day: 'Vie', completed: 9, created: 7 },
      { day: 'Sáb', completed: 4, created: 5 },
      { day: 'Dom', completed: 3, created: 4 }
    ];

    return { statusChartData, departmentData, weeklyData };
  }, [stats, personnel]);

  // Memoize derived metrics
  const metrics = useMemo(() => {
    const avgTime = stats.totalTasks > 0 
      ? (tasks.reduce((acc, task) => acc + task.estimatedHours, 0) / stats.totalTasks).toFixed(1)
      : '0';
    
    const todayTasks = tasks.filter(task => {
      const today = new Date().toDateString();
      return task.createdAt.toDateString() === today;
    }).length;
    
    const efficiency = stats.activeTasks > 0 
      ? Math.round((stats.completedTasks / (stats.completedTasks + stats.activeTasks)) * 100)
      : 100;

    return { avgTime, todayTasks, efficiency };
  }, [tasks, stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Panel de Control Industrial</h1>
            <p className="text-muted-foreground">
              Gestión integral de tareas y personal en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-medium">
              <TrendingUp className="w-4 h-4 mr-2" />
              Productividad: {stats.completionRate.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="font-medium">
              <Activity className="w-4 h-4 mr-2" />
              {stats.activeTasks} tareas activas
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Tareas</p>
              <p className="text-3xl font-semibold mt-1">{stats.totalTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Sistema completo</p>
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Personal Activo</p>
              <p className="text-3xl font-semibold mt-1">{stats.activePersonnel}</p>
              <p className="text-sm text-muted-foreground mt-1">En operación</p>
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Completadas</p>
              <p className="text-3xl font-semibold mt-1">{stats.completedTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Finalizadas</p>
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Urgentes</p>
              <p className="text-3xl font-semibold mt-1">{stats.urgentTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Requieren atención</p>
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section - Only render if data exists */}
      {stats.totalTasks > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                <PieChart className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Distribución de Tareas</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData.statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {chartData.statusChartData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Department Distribution */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Personal por Departamento</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="department" 
                    tick={{ fontSize: 12 }}
                    className="text-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-foreground"
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
              <Timer className="h-4 w-4" />
            </div>
            <h4 className="font-semibold">Tiempo Promedio</h4>
          </div>
          <p className="text-2xl font-semibold">{metrics.avgTime}h</p>
          <p className="text-sm text-muted-foreground">Por tarea</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <h4 className="font-semibold">Tareas Hoy</h4>
          </div>
          <p className="text-2xl font-semibold">{metrics.todayTasks}</p>
          <p className="text-sm text-muted-foreground">Creadas hoy</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h4 className="font-semibold">Eficiencia</h4>
          </div>
          <p className="text-2xl font-semibold">{metrics.efficiency}%</p>
          <p className="text-sm text-muted-foreground">Tasa de éxito</p>
        </Card>
      </div>
    </div>
  );
});