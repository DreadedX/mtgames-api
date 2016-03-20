var base_url = "http://192.168.178.75:8080/v0/auth"
var client_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOjIsImlhdCI6MTQ1ODQ5MDQ0OCwidHlwZSI6ImNsaWVudCIsInZlcnNpb24iOjB9.fiYDKxoZsiSY4Bk6BKIz0XjLj4Sxf65mIz9dpJHk2mc";
var redir_uri = "http://192.168.178.75:8080/v0/auth/rooster.html";

if (getSearchParameters().token != undefined) {

	console.log("Storing new token");
	setCookie("rooster_token", getSearchParameters().token);
	location.replace(redir_uri);
}

getZermeloToken()

function showRooster() {

	$("#login").hide();
}

function showLogin() {

	$("#auth").attr("src", base_url + "?client_token=" + client_token + "&redir_uri=" + redir_uri);
}

function getZermeloToken() {

	var finalData = '{"token":' + JSON.stringify(getCookie("rooster_token")) + '}';
	console.log("Verifying token: " + getCookie("rooster_token"));

	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		if (xhttp.readyState == 4) {
			switch(xhttp.status) {
				case 200:
					// User is logged in, show rooster
					showRooster();
					break;
				default:
					// User is not logged in, show login
					showLogin();
					break;
			}
		}
	}
	xhttp.open("POST", "http://192.168.178.75:8080/v0/user/~me", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(finalData);
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}

function getSearchParameters() {
	var prmstr = window.location.search.substr(1);
	return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
	var params = {};
	var prmarr = prmstr.split("&");
	for ( var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}
