import { TaskStatus } from "../models/task-status";

export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'A fazer';

    case 'IN_PROGRESS':
      return 'Em progresso';

    case 'DONE':
      return 'Concluído';
  }
}