import { TaskStatus } from './task-status';

export interface CreateTask {
  title: string;
  description: string;
  status: TaskStatus;
}