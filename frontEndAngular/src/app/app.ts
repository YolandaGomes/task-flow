import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { TaskBoard } from './components/task-board/task-board';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, TaskBoard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontEndAngular');
}
