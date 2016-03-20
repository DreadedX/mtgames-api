package main

import (
	"github.com/dgrijalva/jwt-go"
	"fmt"
	"time"
)

var signingKey = []byte("dfe5bec390ab9254cbb10a8981a5b6ae8c2d2c1e")

func TokenUserCreate(user User, clientId float64) string {

	// Create the token
	token := jwt.New(jwt.SigningMethodHS256)
	// Set some claims
	token.Claims["user_id"] = user.ID
	token.Claims["client_id"] = clientId
	token.Claims["type"] = "user"
	token.Claims["version"] = 0
	token.Claims["exp"] = time.Now().Add(time.Hour * 72).Unix()
	token.Claims["iat"] = time.Now().Unix()
	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString(signingKey)

	if err != nil {

		panic(err)
	}

	return tokenString
}

func TokenClientCreate(clientId int) string {

	// Create the token
	token := jwt.New(jwt.SigningMethodHS256)
	// Set some claims
	token.Claims["client_id"] = clientId
	token.Claims["type"] = "client"
	token.Claims["version"] = 0
	token.Claims["iat"] = time.Now().Unix()
	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString(signingKey)

	if err != nil {

		panic(err)
	}

	return tokenString
}

// TODO: Check iat to make it possible to invalidate all tokens generated before a certain date
func TokenVerify(tokenString string, tokenType string) (*jwt.Token, error) {

	clientToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return signingKey, nil
	})

	if err == nil && clientToken.Valid {
		if val, ok := clientToken.Claims["version"]; ok && val.(float64) == TOKEN_VERSION {
			if val, ok := clientToken.Claims["type"]; ok && val.(string) == tokenType {

				clientId, _ := clientToken.Claims["client_id"]
				err := ClientVerify(int(clientId.(float64)))
				if err == nil {

					return clientToken, nil
				} else {

					return nil, fmt.Errorf("Unknown client")
				}

			} else {

				return nil, fmt.Errorf("Wrong type of token")
			}
		} else {

			return nil, fmt.Errorf("Unknown token version")
		}
	} else {

		return nil, err
	}
}
