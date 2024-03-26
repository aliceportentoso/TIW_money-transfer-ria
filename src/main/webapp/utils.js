/**
 * AJAX call management
 */

	function makeCall(method, url, formElement, cback, reset = true) {
	    var req = new XMLHttpRequest(); // visible by closure
	    req.onreadystatechange = function() {
	      cback(req)
	    }; // closure
	    req.open(method, url);
	    
	    if (formElement == null) {
        req.send(); //Send empty if no form provided
	    } else if (formElement instanceof FormData){
	        req.send(formElement); //Send already serialized form
	    } else {
	        f = new FormData(formElement); 
	      req.send(f);
	      }
	    
	    if (formElement !== null && !(formElement instanceof FormData) && reset === true) {
        formElement.reset(); //Do not touch hidden fields, and restore default values if any
    }
	  }
	
	(function (){
	    var forms = document.getElementsByTagName("form");
	    Array.from(forms).forEach(form => {
	        var input_fields = form.querySelectorAll('input:not([type="button"]):not([type="hidden"])');
	        var button = form.querySelector('input[type="button"]');
	        Array.from(input_fields).forEach(input => {
	            input.addEventListener("keydown", (e) => {
	                if(e.keyCode == 13){
	                    e.preventDefault();
	                    let click = new Event("click");
	                    button.dispatchEvent(click);
	                }
	            });
	        });
	    });
	})();