package service

import (
	"backEndGo/model"
	"backEndGo/repository"
)

type TaskService struct {
	repository repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) TaskService {
	return TaskService{
		repository: repo,
	}
}

// responsavel por tratar as rotas
func (ts *TaskService) GetTasks() ([]model.Task, error) {
	return ts.repository.GetTasks()
}

func (ts *TaskService) CreateTask(task model.Task) (model.Task, error) {

	taskId, err := ts.repository.CreateTask(task)

	if (err != nil){
		return model.Task{}, err
	}

	task.ID = taskId

	return task, err
}

//get task por id
func (ts *TaskService) GetTaskById(idTask int) (*model.Task, error){

	//chamar o repository
	task, err := ts.repository.GetTaskById(idTask)
	if (err != nil){
		return nil, err
	}

	return task, nil
}

func (ts *TaskService) DeleteTask(idTask int) (bool, error) {

	deleted, err := ts.repository.DeleteTask(idTask)
	if (err != nil){
		return false, err
	}

	return deleted, nil
}

func (ts *TaskService) UpdateTask(task model.Task) (*model.Task, error) {

	updatedTask, err := ts.repository.UpdateTask(task)

	if err != nil {
		return nil, err
	}

	return updatedTask, nil
}
