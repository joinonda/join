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
  dueDate: Timestamp;
  priority: 'urgent' | 'madium' | 'low';
  category: string;
  status: 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
  assignedTo: string[];
  subtasks: Subtask[];
  createdAt: Timestamp;
}

export interface Subtask {
  is: string;
  title: string;
  completed: boolean;
}
