package main

import (
	"log"
	"net/http"
)

func main() {

	InitDatabaseUser()
	InitDatabaseClient()

	router := NewRouter()

	log.Fatal(http.ListenAndServe(":8080", router))
}
