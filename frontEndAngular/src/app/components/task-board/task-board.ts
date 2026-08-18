import { Component, inject, signal } from '@angular/core';
import { TaskColumn } from '../task-column/task-column';
import { Task } from '../../models/task';
import { MatIconModule } from '@angular/material/icon';

import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-board',
  imports: [TaskColumn, MatIconModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})

export class TaskBoard {

  private taskService = inject(TaskService);
  private router = inject(Router);

  tasks = signal<Task[]>([]);

  constructor() {
    this.taskService.getTasks().subscribe({
      next: tasks => {
        this.tasks.set(tasks);
        console.log('Tasks recebidas da API:', tasks);
      },
      error: error => {
        console.error('Erro ao buscar tasks:', error);
      }
    });
  }

  newTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  updateTask(updatedTask: Task): void {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === updatedTask.id
          ? updatedTask
          : task
      )
    );
  }

  deleteTask(taskId: number): void {
  this.tasks.update(tasks =>
    tasks.filter(task => task.id !== taskId)
  );
  }

 moveTask(task: Task): void {

  this.taskService.updateTask(task).subscribe({
    next: updatedTask => {
      this.updateTask(updatedTask);
    },

    error: error => {
      console.error('Erro ao mover tarefa:', error);
    }
  });

}
  
}