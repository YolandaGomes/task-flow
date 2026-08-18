import { Component, input, inject, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialog } from '../task-dialog/task-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../models/task';
import { TaskStatus } from '../../models/task-status';



@Component({
  selector: 'app-task-card',
  imports: [MatCardModule,
            MatIconModule,
            MatButtonModule
            ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})

export class TaskCard {
   task = input.required<Task>();

   taskUpdated = output<Task>();

   taskDeleted = output<number>();

   taskMoved = output<Task>();

   //obtém uma instância do serviço de diálogo do Angular Material
   private dialog = inject(MatDialog);

   // abrir modal
   openTaskDialog(): void {

      const dialogRef = this.dialog.open(TaskDialog, {
        width: '500px',
        data: this.task()
      });

      dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }

      if (result.deleted) {
        this.taskDeleted.emit(result.taskId);
        return;
      }

      this.taskUpdated.emit(result);
    });
  }

  moveForward(event: Event): void {
      event.stopPropagation();

      const currentTask = this.task();

      let newStatus: TaskStatus;
      if (currentTask.status === 'TODO') {
          newStatus = 'IN_PROGRESS';
        } else {
          newStatus = 'DONE';
        }

      this.taskMoved.emit({
          ...currentTask,
          status: newStatus
      });
  }

  moveBackward(event: Event): void {
      event.stopPropagation();

      const currentTask = this.task();

      let newStatus: TaskStatus;
      if (currentTask.status === 'DONE') {
          newStatus = 'IN_PROGRESS';
        } else {
          newStatus = 'TODO';
        }

      this.taskMoved.emit({
          ...currentTask,
          status: newStatus
      });
  }

}
