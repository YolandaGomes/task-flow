package main

import (
	"backEndGo/controller"
	"backEndGo/db"
	"backEndGo/repository"
	"backEndGo/service"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {

	server := gin.Default()

	server.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:4200"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
}))

	//db connection
	dbConnection, err := db.ConnectDB()
	if err != nil {
		panic(err)
	}

	//camada repository
	TaskRepository := repository.NewTaskRepository(dbConnection)

	//camada de service
	TaskService := service.NewTaskService(TaskRepository)

	//camada de controler
	TaskController := controller.NewTaskController(TaskService)

	//rota de ping
	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	//rotas:
	server.GET("/tasks", TaskController.GetTasks)
	server.POST("/tasks", TaskController.CreateTask)
	server.GET("/tasks/:taskId", TaskController.GetTaskById)
	server.DELETE("/tasks/:taskId", TaskController.DeleteTask)
	server.PUT("/tasks/:taskId", TaskController.UpdateTask)

	server.Run(":8000")

}
