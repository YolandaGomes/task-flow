package controller

import (
	"backEndGo/model"
	"backEndGo/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

//receber a requisição - tratar a requisição

type taskController struct{
	//usecase - Service
	taskService service.TaskService

}

func NewTaskController(service service.TaskService) taskController {
	return taskController{
		taskService: service,
	}
}

func (tc *taskController) GetTasks(ctx *gin.Context){

	tasks, err := tc.taskService.GetTasks()
	if(err != nil) {
		ctx.JSON(http.StatusInternalServerError, err)
	}

	ctx.JSON(http.StatusOK, tasks)
}

//post - precisamos receber no body da requisição
func (tc *taskController) CreateTask(ctx *gin.Context){
	var task model.Task
	err := ctx.BindJSON(&task) //& endereço de memória

	if err != nil {
		ctx.JSON(http.StatusBadRequest, err)
		return 
	}

	insertedTask, err := tc.taskService.CreateTask(task)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return 
	}

	ctx.JSON(http.StatusCreated, insertedTask)

}

//getById
func (tc *taskController) GetTaskById(ctx *gin.Context){

	id := ctx.Param("taskId")
	//verificar se id não é nulo
	if (id == "") {
		response := model.Response{
			Message: "id da tarefa não pode ser nulo",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return 
	}

	//transforma a string em numero
	taskId, err := strconv.Atoi(id)
	if(err != nil){
		response := model.Response{
			Message: "id da tarefa precisa ser um numero",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return 
	}


	task, err := tc.taskService.GetTaskById(taskId)
	if(err != nil) {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	if task == nil {
		response := model.Response{
			Message: "Tarefa não encontrada na base de dados",
		}
		ctx.JSON(http.StatusNotFound, response)
		return 
	}

	ctx.JSON(http.StatusOK, task)
}

func (tc *taskController) DeleteTask(ctx *gin.Context){

	id := ctx.Param("taskId")
	//verificar se id não é nulo
	if (id == "") {
		ctx.JSON(http.StatusBadRequest, model.Response{
			Message: "id da tarefa não pode ser nulo",
		})
		return 
	}

	//transforma a string em numero
	taskId, err := strconv.Atoi(id)

	if(err != nil){
		ctx.JSON(http.StatusBadRequest, model.Response{
			Message: "id da tarefa precisa ser um numero",
		})
		
		return 
	}

	deleted, err := tc.taskService.DeleteTask(taskId)
	if(err != nil) {
		ctx.JSON(http.StatusInternalServerError, model.Response{
			Message: err.Error(),
		})
		return
	}

	if !deleted {
		ctx.JSON(http.StatusNotFound, model.Response{
			Message: "Tarefa não encontrada",
		})
		
		return 
	}

	ctx.JSON(http.StatusOK, model.Response{
    	Message: "Tarefa removida com sucesso",
	})
}

func (tc *taskController) UpdateTask(ctx *gin.Context) {

	id := ctx.Param("taskId")

	// verificar se id não é nulo
	if id == "" {
		ctx.JSON(http.StatusBadRequest, model.Response{
			Message: "id da tarefa não pode ser nulo",
		})
		return
	}

	// transforma a string em número
	taskId, err := strconv.Atoi(id)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, model.Response{
			Message: "id inválido",
		})
		return
	}

	var task model.Task

	err = ctx.ShouldBindJSON(&task)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, model.Response{
			Message: err.Error(),
		})
		return
	}

	// O ID da task vem da URL, não do JSON
	task.ID = taskId

	updatedTask, err := tc.taskService.UpdateTask(task)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, model.Response{
			Message: err.Error(),
		})
		return
	}

	// Repository retorna nil quando a tarefa não existe
	if updatedTask == nil {
		ctx.JSON(http.StatusNotFound, model.Response{
			Message: "tarefa não encontrada",
		})
		return
	}

	// Retorna a tarefa realmente atualizada pelo banco
	ctx.JSON(http.StatusOK, updatedTask)
}