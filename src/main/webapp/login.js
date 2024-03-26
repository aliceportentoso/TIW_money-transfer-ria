/**
 * Login and signup management
 */
 
(function() {
	
	var login_button = document.getElementById("login_button");
    var signup_button = document.getElementById("signup_button");
    var pwd = signup_button.closest("form").querySelector('input[name="pwd"]');
    var pwd2 = signup_button.closest("form").querySelector('input[name="pwd2"]');
    var login_error = document.getElementById('login_error');
    var signup_error = document.getElementById('signup_error');    

	//listener al bottone per il login
    login_button.addEventListener("click", (e) => {
        var form = e.target.closest("form"); 
        login_error.style.display = 'none';
        if (form.checkValidity()) { //form check
            sendToServer(form, login_error, 'CheckLogin');
        }else 
            form.reportValidity(); //If not valid, notify
    });

    //listener al bottone per la registrazione
    signup_button.addEventListener("click", (e) => {
        var form = e.target.closest("form"); 
        signup_error.style.display = 'none';
        if (form.checkValidity()) { //form check
            //check addizionali
            if (pwd.value != pwd2.value){
                signup_error.textContent = "Passwords do not match";
                signup_error.style.display = 'block';
                return;
            }
            sendToServer(form, signup_error, 'CheckSignUp');
        }else 
            form.reportValidity(); //If not valid, notify
    });
    
    function sendToServer(form, error_div, request_url){
        makeCall("POST", request_url, form, 
           function(x) {
	          if (x.readyState == XMLHttpRequest.DONE) {
	            var message = x.responseText;
	            switch (x.status) {
	              case 200:
	            	sessionStorage.setItem('user', message);
	                window.location.href = "Home.html";
	                break;
	              case 400: // bad request
	              case 401: // unauthorized
	              case 500: // server error
	              default:
	            	error_div.textContent = message;
	            	error_div.style.display = 'block';
	                break;
	            }
               }
           });
    	}
})();