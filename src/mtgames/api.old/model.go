package main

import (
	"net/http"
)

const TOKEN_VERSION = 0

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

// NOTE: The password hash should not be stored in this struct
type User struct {
	ID float64 `json:"id"`
	Username string `json:"username"`
	Email string `json:"email"`
}
type Client struct {
	ID float64 `json:"id"`
	Name string `json:"name"`
}

// TODO: There probably is a better way to do this
// NOTE: This object contains everything that a client can send to the server
type ClientRequest struct {

	Username string `json:"username"`
	Password string `json:"password"`
	Email string `json:"email"`
	ClientToken string `json:"client_token"`
	OtherClientToken string `json:"other_token"`
	Token string `json:"token"`
}


