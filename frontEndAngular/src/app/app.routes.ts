import { Routes } from '@angular/router';
import { TaskBoardPage } from './pages/task-board/task-board';
import { NewTask } from './pages/new-task/new-task';

export const routes: Routes = [
  {
    path: 'tasks',
    component: TaskBoardPage
  },
  {
    path: 'tasks/new',
    component: NewTask
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  }
];
