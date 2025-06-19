
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFollowUpTasks } from "@/hooks/useFollowUpTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Calendar,
  AlertTriangle
} from "lucide-react";

interface FollowUpTasksPanelProps {
  leadId?: string;
}

export const FollowUpTasksPanel = ({ leadId }: FollowUpTasksPanelProps) => {
  const { tasks, loading, createTask, completeTask } = useFollowUpTasks(leadId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    task_type: 'call' as const,
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    lead_id: leadId || ''
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.due_date) return;

    await createTask(newTask);
    setNewTask({
      task_type: 'call',
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      lead_id: leadId || ''
    });
    setShowCreateDialog(false);
  };

  const upcomingTasks = tasks.filter(task => !task.is_completed && new Date(task.due_date) > new Date());
  const overdueTasks = tasks.filter(task => !task.is_completed && new Date(task.due_date) <= new Date());
  const completedTasks = tasks.filter(task => task.is_completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Follow-up Tasks</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Follow-up Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Type</label>
                <Select 
                  value={newTask.task_type} 
                  onValueChange={(value: any) => setNewTask({ ...newTask, task_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center gap-3">
                  {getTaskIcon(task.task_type)}
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      Due: {new Date(task.due_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => completeTask(task.id)}
                    className="text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Tasks ({upcomingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getTaskIcon(task.task_type)}
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      Due: {new Date(task.due_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => completeTask(task.id)}
                    variant="outline"
                    className="text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed Tasks ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 bg-white rounded border opacity-60">
                {getTaskIcon(task.task_type)}
                <div>
                  <p className="font-medium text-sm line-through">{task.title}</p>
                  <p className="text-xs text-gray-600">
                    Completed: {task.completed_at ? new Date(task.completed_at).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
            {completedTasks.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                and {completedTasks.length - 3} more completed tasks...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
      )}
    </div>
  );
};
