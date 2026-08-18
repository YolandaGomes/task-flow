import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TaskService } from '../../services/task.service';
import { CreateTask } from '../../models/create-task';
import { TaskStatus } from '../../models/task-status';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Router } from '@angular/router';

@Component({
  selector: 'app-new-task',
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})
export class NewTask {

    private taskService = inject(TaskService);

    private router = inject(Router);

    private snackBar = inject(MatSnackBar);

    taskForm = new FormGroup({

    title: new FormControl('', {
      nonNullable: true,
      //O título é obrigatório
      validators: [Validators.required]
    }),

    description: new FormControl('', {
      nonNullable: true
    }),

    //TODO como valor inicial do status
    status: new FormControl<TaskStatus>('TODO', {
    nonNullable: true
   })

  });

  createTask() {
  if (this.taskForm.invalid) {
    return;
  }

  const task: CreateTask = this.taskForm.getRawValue();

  this.taskService.createTask(task).subscribe({
    next: id => {
      console.log('Tarefa criada com ID:', id);

      this.snackBar.open(
          'Tarefa Criada com sucesso!',
          'Fechar',
          {
            duration: 3000
          }
      );
      this.router.navigate(['/tasks']);
    },

    error: error => {
      console.error('Erro ao criar tarefa:', error);
      
        this.snackBar.open(
        'Não foi possível criar a tarefa.',
        'Fechar',
        { duration: 4000 }
      );
    }   
  });
}

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

}
