package db

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"
)

const (
	host = "postgres"
	port = 5432
)

func ConnectDB() (*sql.DB, error) {

	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}

	for i := 0; i<10; i++ {
		err = db.Ping()
        if err == nil {
            fmt.Println("Connected to", dbname)
            return db, nil
		}

		fmt.Println("Waiting for postgres...")
        time.Sleep(2 * time.Second)
	}


	return nil, err
}
