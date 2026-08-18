package repository

//Repository Pattern. O objetivo dele é separar a lógica de acesso ao banco de dados do restante da aplicação.

import (
	"backEndGo/model"
	"database/sql"
	"fmt"
)

type TaskRepository struct {
	//sql.DB é a estrutura da biblioteca padrão do Go (database/sql) responsável por gerenciar a conexão com o banco de dados.
	connection *sql.DB
}

// função construtora para instanciar essa estrutura de forma organizada.
func NewTaskRepository(connection *sql.DB) TaskRepository {
	return TaskRepository{
		connection: connection,
	}
}

func (tr *TaskRepository) GetTasks() ([]model.Task, error) {
	query := "SELECT id, title, description, status, created_at, updated_at FROM tasks"
	rows, err := tr.connection.Query(query)
	if err != nil {
		fmt.Println(err)
		return []model.Task{}, err
	}

	var taskList []model.Task
	var taskObj model.Task

	for rows.Next() {
		err = rows.Scan(
			&taskObj.ID,
			&taskObj.Title,
			&taskObj.Description,
			&taskObj.Status,
			&taskObj.CreatedAt,
			&taskObj.UpdatedAt)

		if err != nil {
			fmt.Println(err)
			return []model.Task{}, err
		}

		taskList = append(taskList, taskObj)
	}

	rows.Close()

	return taskList, nil
}

func (tr *TaskRepository) CreateTask(task model.Task) (int, error) {

	var id int
	query, err := tr.connection.Prepare("INSERT INTO tasks(title,description,status)" +
		"VALUES ($1, $2, $3) RETURNING id")

	if err != nil {
		fmt.Println(err)
		return 0, err
	}

	//passando os parametros que vamos receber do usuario
	//QueryRow() é usado quando esperamos receber uma linha
	err = query.QueryRow(task.Title, task.Description, task.Status).Scan(&id)
	//scan() escaneia o id da linha que foi inserida

	//verificar por um erro
	if err != nil {
		fmt.Println(err)
		return 0, err
	}

	query.Close()
	return id, nil
}

func (tr *TaskRepository) GetTaskById(idTask int) (*model.Task, error) {

	//inicializar a query
	query, err := tr.connection.Prepare("SELECT * FROM tasks WHERE id=$1")

	if err != nil {
		fmt.Println(err)
		//retorna model.Task vazio e o erro
		return nil, err
	}

	//variavel onde as informações do banco desse id serão retornadas. do tipo model.Task
	var task model.Task

	//metodo que executa de fato a query e retornar os dados na variavel task (Query é usado para comandos que retornam linhas)
	err = query.QueryRow(idTask).Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.Status,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	if err != nil {
		//banco não encontrou registros com esse id
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	query.Close()
	return &task, nil

}

func (tr *TaskRepository) DeleteTask(idTask int) (bool, error) {

	//true = deletou;
	//false = não encontrou o registro;
	//error = ocorreu um erro no banco.

	result, err := tr.connection.Exec(
		"DELETE FROM tasks WHERE id=$1", idTask)

	if err != nil {
		return false, err
	}

	//Verificar quantas linhas foram afetadas
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	if rowsAffected == 0 {
		//banco não encontrou registros com esse id
		return false, nil
	}

	return rowsAffected > 0, nil

}

// UPDATE - recebe um task completo e retorna sucesso ou erro
func (tr *TaskRepository) UpdateTask(task model.Task) (*model.Task, error) {

		var updatedTask model.Task

	err := tr.connection.QueryRow(
		`UPDATE tasks
		 SET title = $1,
		     description = $2,
		     status = $3,
		     updated_at = NOW()
		 WHERE id = $4
		 RETURNING id, title, description, status, created_at, updated_at`,
		task.Title,
		task.Description,
		task.Status,
		task.ID,
	).Scan(
		&updatedTask.ID,
		&updatedTask.Title,
		&updatedTask.Description,
		&updatedTask.Status,
		&updatedTask.CreatedAt,
		&updatedTask.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &updatedTask, nil
}
