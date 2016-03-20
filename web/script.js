var client_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOjEsImlhdCI6MTQ1ODE2MjIxOCwidHlwZSI6ImNsaWVudCIsInZlcnNpb24iOjB9.saUkv-VVx71lpJ1IIwv0129yvQoRgLJZKi7jSsyxZBg";

var token = getCookie("token");

var strings = getStrings();

// Set language
$("#username_label").text(strings.username);
$("#password_label").text(strings.password);
$("#login_label").text(strings.login);
$("#lost_password_label").text(strings.lost_password);
$("#register_label").text(strings.register);
$("#auth_label").text(strings.auth);
$("#other_user_label").text(strings.other_user);

// Navigate with enter key
$(document).ready(function(){
	$('#username').keypress(function(e){
		if(e.keyCode==13) {
			$('#password').focus();
		}
	});
	$('#password').keypress(function(e){
		if(e.keyCode==13) {
			$('#login_label').click();
		}
	});
});

// TODO: Is this needed?
componentHandler.upgradeDom();

// Try to get user data
getUser();
getClient();

// Show login dialog
function showLogin() {

	$("#login").show();
	$("#auth").hide();
	$("#lost-password").hide();
	$("#register").hide();
}
function showAuth() {

	$("#login").hide();
	$("#auth").show();
	$("#lost-password").hide();
	$("#register").hide();
}
function showLostPassword() {

	$("#login").hide();
	$("#auth").hide();
	$("#lost-password").show();
	$("#register").hide();
}
function showRegister() {

	$("#login").hide();
	$("#auth").hide();
	$("#lost-password").hide();
	$("#register").show();
}

// If username or password changes, remove invalidness
function makeValid() {

	$("#textfield_username").removeClass("is-invalid");
	$("#textfield_password").removeClass("is-invalid");
	$("#error").text("");
}

function getClient() {

	var finalData = '{"client_token":' + JSON.stringify(getSearchParameters().client_token) + '}';

	xhttpc = new XMLHttpRequest();
	xhttpc.onreadystatechange = function() {

		if (xhttpc.readyState == 4) {
			switch(xhttpc.status) {
				case 200:
					client = JSON.parse(xhttpc.responseText);
					$("#auth_text").text(strings.auth_text.replace("{0}", client.name));
					$("#client_name").text(client.name);
					$("#client_image").css({"background": "url('http://lorempixel.com/400/400/abstract')"});
					console.log(xhttpc.responseText);
					console.log(client);
					break;
				default:
					// This should not happen
					console.log(xhttpc.responseText);
					break;
			}
		}
	}
	xhttpc.open("POST", "http://192.168.178.75:8080/v0/client", true);
	xhttpc.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttpc.send(finalData);
}

// Try to get the user data
function getUser() {

	var finalData = '{"token":' + JSON.stringify(token) + '}';

	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		if (xhttp.readyState == 4) {
			switch(xhttp.status) {
				case 200:
					// User is logged in, fill auth dialog with data
					var user = JSON.parse(xhttp.responseText);
					showAuth();

					$("#avatar_user").css({"background-image": "url('http://www.gravatar.com/avatar/" + md5(user.email) +"')"});
					$("#email").text(user.email);
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

// Logs the user out and show login dialog
function doLogout() {

	deleteCookie("token");
	$("#ui").empty();
	showLogin();
}

// Authenticate application
function doAuth() {

	var finalData = '{"token":' + JSON.stringify(getCookie("token")) + ', "other_token":' + JSON.stringify(getSearchParameters().client_token) + '}';
	console.log(finalData)

	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		if (xhttp.readyState == 4) {
			switch(xhttp.status) {
				case 200:
					// TODO: Send mtauth user and app client token in exchange for app user token
					var redir = getSearchParameters().redir_uri + "?token=" + JSON.parse(xhttp.responseText).token;
					if (window.opener != null) {
						window.opener.location.replace(redir);
						window.close();
					} else if (window.top != null) {
						window.top.location.replace(redir);
					} else {
						location.replace(redir);
					}
					break;
				default:
					console.log(xhttp.responseText);
					break;
			}
		}
	}
	xhttp.open("POST", "http://192.168.178.75:8080/v0/auth/token/other", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(finalData);
}

// Try to log the user in
function doLogin() {

	// TODO: Data needs to be transformed to the correct structure
	var formData = JSON.parse(JSON.stringify($("#login_form").serializeArray()));
	var finalData = '{"username":' + JSON.stringify(formData[0].value) + ', "password":' + JSON.stringify(formData[1].value) + ', "client_token":' + JSON.stringify(client_token) + '}';

	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		if (xhttp.readyState == 4) {

			switch(xhttp.status) {
				case 200:
					token = JSON.parse(xhttp.responseText).token;
					setCookie("token", token, 3);
					getUser();
					break;
				case 400:
					$("#textfield_username").addClass("is-invalid");
					$("#textfield_password").addClass("is-invalid");
					$("#error").text("Incorrect username/password");
					break;
				default:
					$("#textfield_username").addClass("is-invalid");
					$("#textfield_password").addClass("is-invalid");
					$("#error").text(xhttp.responseText);
					break;
			}
		}
	}
	console.log(xhttp.responseText);
	xhttp.open("POST", "http://192.168.178.75:8080/v0/auth/token", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(finalData);
}

// Utility functions
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

function deleteCookie(cname) {

	document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function detectLanguage() {

	var lang = getSearchParameters().lang;

	if (lang == undefined) {
		if (navigator.languages != undefined) {
			lang = navigator.languages[0]; 
		} else {
			lang = navigator.language;
		}
	}

	return lang;
}

// Language options
function getStrings() {

	if (detectLanguage().indexOf("nl") >= 0) {

		var strings = {
			"username":"Gebruikersnaam",
			"password":"Wachtwoord",
			"login":"Inloggen",
			"lost_password":"Wachtwoord vergeten?",
			"register":"Registreren", 
			"auth":"Toestaan",
			"other_user":"Andere gebruiker",
			"auth_text":"Wilt u toegang verlenen aan: '{0}'?"
		};
		return strings;
	} else {

		var strings = {
			"username":"Username", 
			"password":"Password",
			"login":"Login", 
			"lost_password":"Lost your password?", 
			"auth":"Authorize",
			"register":"Register", 
			"other_user":"Other user", 
			"auth_text":"Do you want to authorize: '{0}'?"
		};
		return strings;
	}
}

// md5 hash function (used for gravatar)
/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*global unescape, define, module */

;(function ($) {
  'use strict'

  /*
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
  function safe_add (x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF)
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
  function bit_rol (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  /*
  * These functions implement the four basic operations the algorithm uses.
  */
  function md5_cmn (q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
  }
  function md5_ff (a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
  }
  function md5_gg (a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
  }
  function md5_hh (a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5_ii (a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
  }

  /*
  * Calculate the MD5 of an array of little-endian words, and a bit length.
  */
  function binl_md5 (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    var i
    var olda
    var oldb
    var oldc
    var oldd
    var a = 1732584193
    var b = -271733879
    var c = -1732584194
    var d = 271733878

    for (i = 0; i < x.length; i += 16) {
      olda = a
      oldb = b
      oldc = c
      oldd = d

      a = md5_ff(a, b, c, d, x[i], 7, -680876936)
      d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
      b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
      a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
      d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
      c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
      b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
      a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
      d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
      c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
      b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
      a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
      d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
      c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
      b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

      a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
      d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
      c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
      b = md5_gg(b, c, d, a, x[i], 20, -373897302)
      a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
      d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
      c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
      b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
      a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
      d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
      c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
      b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
      a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
      d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
      c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
      b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

      a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
      d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
      c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
      b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
      a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
      d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
      c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
      b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
      a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
      d = md5_hh(d, a, b, c, x[i], 11, -358537222)
      c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
      b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
      a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
      d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
      c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
      b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

      a = md5_ii(a, b, c, d, x[i], 6, -198630844)
      d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
      c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
      b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
      a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
      d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
      c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
      b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
      a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
      d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
      c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
      b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
      a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
      d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
      c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
      b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

      a = safe_add(a, olda)
      b = safe_add(b, oldb)
      c = safe_add(c, oldc)
      d = safe_add(d, oldd)
    }
    return [a, b, c, d]
  }

  /*
  * Convert an array of little-endian words to a string
  */
  function binl2rstr (input) {
    var i
    var output = ''
    for (i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
    }
    return output
  }

  /*
  * Convert a raw string to an array of little-endian words
  * Characters >255 have their high-byte silently ignored.
  */
  function rstr2binl (input) {
    var i
    var output = []
    output[(input.length >> 2) - 1] = undefined
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0
    }
    for (i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
    }
    return output
  }

  /*
  * Calculate the MD5 of a raw string
  */
  function rstr_md5 (s) {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
  }

  /*
  * Calculate the HMAC-MD5, of a key and some data (raw strings)
  */
  function rstr_hmac_md5 (key, data) {
    var i
    var bkey = rstr2binl(key)
    var ipad = []
    var opad = []
    var hash
    ipad[15] = opad[15] = undefined
    if (bkey.length > 16) {
      bkey = binl_md5(bkey, key.length * 8)
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636
      opad[i] = bkey[i] ^ 0x5C5C5C5C
    }
    hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128))
  }

  /*
  * Convert a raw string to a hex string
  */
  function rstr2hex (input) {
    var hex_tab = '0123456789abcdef'
    var output = ''
    var x
    var i
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i)
      output += hex_tab.charAt((x >>> 4) & 0x0F) +
      hex_tab.charAt(x & 0x0F)
    }
    return output
  }

  /*
  * Encode a string as utf-8
  */
  function str2rstr_utf8 (input) {
    return unescape(encodeURIComponent(input))
  }

  /*
  * Take string arguments and return either raw or hex encoded strings
  */
  function raw_md5 (s) {
    return rstr_md5(str2rstr_utf8(s))
  }
  function hex_md5 (s) {
    return rstr2hex(raw_md5(s))
  }
  function raw_hmac_md5 (k, d) {
    return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))
  }
  function hex_hmac_md5 (k, d) {
    return rstr2hex(raw_hmac_md5(k, d))
  }

  function md5 (string, key, raw) {
    if (!key) {
      if (!raw) {
        return hex_md5(string)
      }
      return raw_md5(string)
    }
    if (!raw) {
      return hex_hmac_md5(key, string)
    }
    return raw_hmac_md5(key, string)
  }

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return md5
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = md5
  } else {
    $.md5 = md5
  }
}(this))
