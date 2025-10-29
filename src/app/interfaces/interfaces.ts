export interface Interfaces {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface NewContact {
  fullName: string;
  email: string;
  phone: string;
}

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
  createdAt: Date | null;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}
