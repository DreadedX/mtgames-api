package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"io"
	"io/ioutil"
	"strconv"

	"github.com/gorilla/mux"
)

func AuthPageHandler(w http.ResponseWriter, r *http.Request) {

	http.ServeFile(w, r, "./web/index.html")
}

// TODO: In the future this is hosted on the regular domain
func AuthResourceHandler(w http.ResponseWriter, r *http.Request) {

	resource := mux.Vars(r)["resource"]

	http.ServeFile(w, r, "./web/" + resource)
}

func TokenNewHandler(w http.ResponseWriter, r *http.Request) {

	// TODO: This should be a function
	var clientRequest ClientRequest

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {

		panic(err)
	}

	if err := r.Body.Close(); err != nil {

		panic(err)
	}

	if err := json.Unmarshal(body, &clientRequest); err != nil {

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422)

		if err := json.NewEncoder(w).Encode(err); err != nil {

			panic(err)
		}
		return
	}

	token, err := TokenVerify(clientRequest.ClientToken, "client")
	if err == nil {

		if user, err := UserVerify(clientRequest); err == nil {

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)

			fmt.Fprintf(w, `{"token":"%s"}`, TokenUserCreate(user, token.Claims["client_id"].(float64)))
		} else {

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusBadRequest)

			fmt.Fprintf(w, `{"error":"%s"}`, err)
		}
	} else {

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusForbidden)

			fmt.Fprintf(w, `{"error":"%s"}`, err)
	}
}

func TokenNewOtherHandler(w http.ResponseWriter, r *http.Request) {

	// TODO: This should be a function
	var clientRequest ClientRequest

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {

		panic(err)
	}

	if err := r.Body.Close(); err != nil {

		panic(err)
	}

	if err := json.Unmarshal(body, &clientRequest); err != nil {

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422)

		if err := json.NewEncoder(w).Encode(err); err != nil {

			panic(err)
		}
		return
	}

	token, err := TokenVerify(clientRequest.Token, "user");
	if err == nil {

		if otherClientToken, err := TokenVerify(clientRequest.OtherClientToken, "client"); err == nil {

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)

			var user = User{ID: token.Claims["user_id"].(float64)}

			fmt.Fprintf(w, `{"token":"%s"}`, TokenUserCreate(user, otherClientToken.Claims["client_id"].(float64)))
		} else {

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusBadRequest)

			fmt.Fprintf(w, `{"error":"%s"}`, err)
		}
	} else {

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusForbidden)

			fmt.Fprintf(w, `{"error":"%s"}`, err)
	}
}

func TokenClientGenHandler(w http.ResponseWriter, r *http.Request) {

	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	fmt.Fprintf(w, TokenClientCreate(id))
}

func UserGetHandler(w http.ResponseWriter, r *http.Request) {

	// TODO: This should be a function
	var clientRequest ClientRequest

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {

		panic(err)
	}

	if err := r.Body.Close(); err != nil {

		panic(err)
	}

	if err := json.Unmarshal(body, &clientRequest); err != nil {

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422)

		if err := json.NewEncoder(w).Encode(err); err != nil {

			panic(err)
		}
		return
	}

	token, err := TokenVerify(clientRequest.Token, "user")

	if err == nil {

		idString := mux.Vars(r)["id"]

		id, err := strconv.Atoi(idString)

		if err != nil && idString == "~me" && token != nil{

			id = int(token.Claims["user_id"].(float64))
		}


		if user, err := UserGet(id); err == nil {

			if err := json.NewEncoder(w).Encode(user); err != nil {

				panic(err)
			}
		} else {

			fmt.Fprintf(w, `{"error":"%s"}`, err)
		}
	} else {

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusForbidden)

		fmt.Fprintf(w, `{"error":"%s"}`, err)
	}
}

func ClientGetHandler(w http.ResponseWriter, r *http.Request) {

	// TODO: This should be a function
	var clientRequest ClientRequest

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {

		panic(err)
	}

	if err := r.Body.Close(); err != nil {

		panic(err)
	}

	if err := json.Unmarshal(body, &clientRequest); err != nil {

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422)

		if err := json.NewEncoder(w).Encode(err); err != nil {

			panic(err)
		}
		return
	}

	token, err := TokenVerify(clientRequest.ClientToken, "client")

	if err == nil {

		id := int(token.Claims["client_id"].(float64))

		if client, err := ClientGet(id); err == nil {

			if err := json.NewEncoder(w).Encode(client); err != nil {

				panic(err)
			}
		} else {

			fmt.Fprintf(w, `{"error":"%s"}`, err)
		}
	} else {

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusForbidden)

		fmt.Fprintf(w, `{"error":"%s"}`, err)
	}
}
