import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskColumn } from './task-column';

describe('TaskColumn', () => {
  let component: TaskColumn;
  let fixture: ComponentFixture<TaskColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskColumn],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskColumn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
