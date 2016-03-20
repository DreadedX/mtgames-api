package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
	"log"
	"os"
	"fmt"
)

const dbFileUser = "./db/users.db"

var dbUser *sql.DB

func InitDatabaseUser() {

	var err error
	dbUser, err = sql.Open("sqlite3", dbFileUser)

	if err != nil {

		log.Fatal(err)
	}
	// defer dbUser.Close()

	if _, err := os.Stat(dbFileUser); os.IsNotExist(err) {

		sqlStmt := `CREATE TABLE users (id integer PRIMARY KEY, username tinytext UNIQUE, hash binary(60), email tinytext UNIQUE);`

		_, err = dbUser.Exec(sqlStmt)
		if err != nil  {
			log.Printf("%q: %s", err, sqlStmt)
			os.Exit(-1)
		}
	}
}

func UserVerify(clientRequest ClientRequest) (User, error) {

	stmt, err := dbUser.Prepare("SELECT * FROM [users] WHERE username=?;")
	if err != nil {

		log.Fatal(err)
	}
	rows, err := stmt.Query(clientRequest.Username)
	if err != nil {

		log.Fatal(err)
	}

	for rows.Next() {

		var user User
		var hash []byte
		rows.Scan(&user.ID, &user.Username, &hash, &user.Email)

		err := bcrypt.CompareHashAndPassword(hash, []byte(clientRequest.Password))

		if err == nil {

			return user, nil
		}
	}
	return User{}, fmt.Errorf("Incorrect username/password")
}

func UserGet(id int) (User, error) {

	stmt, err := dbUser.Prepare("SELECT * FROM [users] WHERE id=?;")
	if err != nil {

		log.Fatal(err)
	}
	rows, err := stmt.Query(id)
	if err != nil {

		log.Fatal(err)
	}

	for rows.Next() {

		var user User
		var hash []byte
		rows.Scan(&user.ID, &user.Username, &hash, &user.Email)

		return user, nil
	}
	return User{}, fmt.Errorf("Unknown user")
}

