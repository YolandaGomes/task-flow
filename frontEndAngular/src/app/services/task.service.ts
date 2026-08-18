import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task } from '../models/task';
import { CreateTask } from '../models/create-task';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8000/tasks';

    // GET /tasks
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // GET /tasks/:taskId
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // POST /tasks
  createTask(task: CreateTask): Observable<number> {
    return this.http.post<number>(this.apiUrl, task);
  }

   // PUT /tasks/:taskId
  updateTask(task: Task): Observable<Task> {
  return this.http.put<Task>(
    `${this.apiUrl}/${task.id}`,
    task
  );
}

  // DELETE /tasks/:taskId
  deleteTask(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}
