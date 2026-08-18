import { Component, computed, input, output } from '@angular/core';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../models/task';
import { TaskStatus } from '../../models/task-status';
import { getTaskStatusLabel } from '../../utils/task-status-label';

//Angular CDK separa os conceitos: CdkDrag → o que pode ser arrastado - CdkDropList → onde podemos soltar

import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-column',
  imports: [  TaskCard,
              CdkDropList,
              CdkDrag,
              ],
  templateUrl: './task-column.html',
  styleUrl: './task-column.scss',
})

export class TaskColumn {

  status = input<TaskStatus>('TODO');
  tasks = input<Task[]>([]);
  taskUpdated = output<Task>();
  taskDeleted = output<number>();
  taskMoved = output<Task>();
  dropListId = input.required<string>();

  filteredTasks = computed(() =>
  this.tasks().filter(task => task.status === this.status())
  );

  getColumnTitle(): string {
    return getTaskStatusLabel(this.status());
  }


  getHeaderClass(): string {
    switch (this.status()) {
      case 'TODO':
        return 'todo';

      case 'IN_PROGRESS':
        return 'in-progress';

      case 'DONE':
        return 'done';

      default:
        return '';
    }
  }

  drop(event: CdkDragDrop<Task[]>): void {
    
    //Se o usuário apenas reorganizou uma tarefa dentro da mesma coluna, não precisamos alterar o status.
    if (event.previousContainer === event.container) {
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];

    const movedTask: Task = {
      ...task,
      status: this.status()
    };

    this.taskMoved.emit(movedTask);
  }

}

