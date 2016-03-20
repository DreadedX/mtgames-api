package main

var routes = Routes{
	Route{
		"AuthPage",
		"GET",
		"/auth",
		AuthPageHandler,
	},
	Route{
		"AuthResource",
		"GET",
		"/auth/{resource}",
		AuthResourceHandler,
	},
	Route{
		"TokenNew",
		"POST",
		"/auth/token",
		TokenNewHandler,
	},
	Route{
		"TokenNewOther",
		"POST",
		"/auth/token/other",
		TokenNewOtherHandler,
	},
	// NOTE: This is just for testing
	Route{
		"TokenClientGen",
		"GET",
		"/auth/token/client/{id}",
		TokenClientGenHandler,
	},
	Route{
		"UserGet",
		"POST",
		"/user/{id}",
		UserGetHandler,
	},
	Route{
		"ClientGet",
		"POST",
		"/client",
		ClientGetHandler,
	},
}
