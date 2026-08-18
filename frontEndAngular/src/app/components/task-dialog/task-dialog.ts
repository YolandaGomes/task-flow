import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Task } from '../../models/task';
import { TaskService } from '../../services/task.service';

import { DatePipe } from '@angular/common';
import { getTaskStatusLabel } from '../../utils/task-status-label';

import { ReactiveFormsModule, FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-task-dialog',
  imports: [  MatDialogModule,
              MatButtonModule,
              MatIconModule,
              ReactiveFormsModule,
              MatFormFieldModule,
              MatInputModule,
              MatSelectModule,
              DatePipe,
            ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {

  //Receber a tarefa no TaskDialog
  data = inject<Task>(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef<TaskDialog>);

  private taskService = inject(TaskService);

  private snackBar = inject(MatSnackBar);

  editMode = false;

  taskForm = new FormGroup({
    title: new FormControl(this.data.title, {
        nonNullable: true
      }),
    description: new FormControl(this.data.description, {
        nonNullable: true
      }),
    status: new FormControl(this.data.status, {
        nonNullable: true
      })
  });

  getStatusLabel(): string {
  return getTaskStatusLabel(this.data.status);
}

  startEditing(): void {
    this.editMode = true;
  }

  cancelEditing(): void {
    this.editMode = false;
  }

  saveTask(): void {
    const updatedTask = {
      ...this.data,
      ...this.taskForm.value
    };

    this.taskService.updateTask(updatedTask).subscribe({
      next: response => {
        console.log('Tarefa atualizada:', response);

        this.dialogRef.close(response);

        this.snackBar.open(
          'Tarefa atualizada com sucesso!',
          'Fechar',
          {
            duration: 3000
          }
        );
      },

      error: error => {
        console.error('Erro ao atualizar tarefa:', error);
          this.snackBar.open(
            'Não foi possível atualizar a tarefa.',
            'Fechar',
            { duration: 4000 }
          );
      }
    });
  }

  deleteTask(): void {
    this.taskService.deleteTask(this.data.id).subscribe({
    next: response => {
      console.log('Tarefa excluída:', response);

      this.dialogRef.close({
        deleted: true,
        taskId: this.data.id
      });

      this.snackBar.open(
        'Tarefa deletada com sucesso!',
        'Fechar',
        {
          duration: 3000
        }
      );
    },

    error: error => {
      console.error('Erro ao excluir tarefa:', error);
      
      this.snackBar.open(
        'Não foi possível deletar a tarefa.',
        'Fechar',
        { duration: 4000 }
      );
    }
  });
  }

}
