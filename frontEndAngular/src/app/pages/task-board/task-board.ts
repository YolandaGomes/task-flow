import { Component } from '@angular/core';
import { TaskBoard } from '../../components/task-board/task-board';

@Component({
  selector: 'app-task-board-page',
  imports: [TaskBoard],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss'
})
export class TaskBoardPage {
}