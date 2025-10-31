export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'urgent' | 'medium' | 'low';
  category: string;
  status: 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
  assignedTo: string[];
  subtasks: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}
