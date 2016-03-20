package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"os"
	"fmt"
)

const dbFileClient = "./db/clients.db"

var dbClient *sql.DB

func InitDatabaseClient() {

	var err error
	dbClient, err = sql.Open("sqlite3", dbFileClient)

	if err != nil {

		log.Fatal(err)
	}
	// defer dbClient.Close()

	if _, err := os.Stat(dbFileClient); os.IsNotExist(err) {

		sqlStmt := `CREATE TABLE clients (id integer PRIMARY KEY, name tinytext UNIQUE);`

		_, err = dbClient.Exec(sqlStmt)
		if err != nil  {
			log.Printf("%q: %s", err, sqlStmt)
			os.Exit(-1)
		}
	}
}

func ClientVerify(id int) error {

	stmt, err := dbClient.Prepare("SELECT * FROM [clients] WHERE id=?;")
	if err != nil {

		log.Fatal(err)
	}
	rows, err := stmt.Query(id)
	if err != nil {

		log.Fatal(err)
	}

	for rows.Next() {

		return nil
	}
	return fmt.Errorf("Unknown client")
}

func ClientGet(id int) (Client, error) {

	stmt, err := dbClient.Prepare("SELECT * FROM [clients] WHERE id=?;")
	if err != nil {

		log.Fatal(err)
	}
	rows, err := stmt.Query(id)
	if err != nil {

		log.Fatal(err)
	}

	for rows.Next() {

		var client Client
		rows.Scan(&client.ID, &client.Name)

		return client, nil
	}
	return Client{}, fmt.Errorf("Unknown client")
}
