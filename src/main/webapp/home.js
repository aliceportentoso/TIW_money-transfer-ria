(function(){
	
	let accountsList, accountDetails, welcome, 
	transactionConfirmation, transactionFailed, addressBook,
	pageOrchestrator = new PageOrchestrator(); // main controller
    
	window.addEventListener("load", () => {
	    if (sessionStorage.getItem("user") == null) {
	      	window.location.href = "index.html";
	    } else {
			
	    	pageOrchestrator.start(); // initialize the components
	      	pageOrchestrator.refresh(); //show welcome, accountsList
	    } 
	}, false);
	
	function PageOrchestrator() { 
		this.start = function() {
			welcome = new Welcome(
				sessionStorage.getItem('user'),
				document.getElementById("div_welcome"),
				document.getElementById("id_logout"));
		
			accountsList = new AccountsList(
				document.getElementById("id_accounts"),
	        	document.getElementById("accounts_alert"));
	        
	        accountDetails = new AccountDetails(
				document.getElementById("div_info_account"),
				document.getElementById("id_account"),
				document.getElementById("id_balance"),
				document.getElementById("transactions_alert"),
				document.getElementById("div_transactions"),
	        	document.getElementById("id_transactions_body"),
	        	document.getElementById("id_send_button"), 
                document.getElementById("div_send_form"),
                document.getElementById("div_send_error"));			
				
			transactionConfirmation = new TransactionConfirmation(
				document.getElementById("div_confirmation"),
				document.getElementById("div_confirmation_body"));
				
			transactionFailed = new TransactionFailed(
				document.getElementById("div_failed"),
				document.getElementById("div_failed_body"),
				document.getElementById("button_failed"));
			
			addressBook = new AddressBook(
				document.getElementById("address_book_text"),
				document.getElementById("button_back"),
				document.getElementById("button_save"),
				document.getElementById("button_do_not_save"),
				document.getElementById("userdest-datalist"),
                document.getElementById("accdest-datalist")); 
				
	    };
	 
		this.refresh = function(account) {
			//mostra il messaggio di benvenuto e tasto di logout
	       	welcome.show();
	       
	      	//mostra l'elenco dei conti (che caricano i dettagli)
	    	accountsList.show(function() {
	        	accountsList.autoclick(account); 
	      	}); 
			//carica i contatti dalla rubrica per poter essere suggeriti dalle opzioni
			addressBook.load();
	    };
	    
	    
	}
	
	
	function Welcome(username, messagecontainer, logout_div) {
		this.messagecontainer = messagecontainer;
	  	this.username = username;
	  	this.logout_div = logout_div;
	  	
	  	this.logout_div.addEventListener("click", e => {
            sessionStorage.clear();
	      	window.location.href = "Logout";
        });
	  	this.show = function() {
	    	messagecontainer.textContent = "Welcome back, " + this.username;
	  	}
	}
	
	function AccountsList(ac_container, alert) {
	    this.alert = alert;
	    this.ac_container = ac_container;
	    this.alert.style.display = "none";

		//chiamata subito per mostrare i bottoni degli account
		this.show = function(next) {
		  var self = this;
		  makeCall("GET", "GetAccountsList", null,	
		    function(req) {
		      if (req.readyState == 4) {
		        switch(req.status){
				case 200:
		        	var accounts = JSON.parse(req.responseText);
		        	if (accounts.length <= 0) {
		            	self.alert.textContent = "No accounts yet!";
		            	self.alert.style.display = "block";
		            	self.ac_container.style.display = "none";
		            	accountDetails.info_container.style.visibility = "hidden";
		            	accountDetails.send_form.style.display = "none";
		            	accountDetails.tr_container.style.visibility = "hidden";
		            	return;
		          	}
		          	self.alert.style.display = "none";
		        	self.create_account_button(accounts);
		        	if (next) next(); // mostra il conto di default
		        	break;
		      
		      	default:
		      		self.alert.textContent = "Request reported status " + 
		      			req.status + ":" + req.responseText;
		      		self.alert.style.display = "block";
		      		self.ac_container.style.display = "none";
		      		break;
		      }}
		    }
		  );
		};
		
		//crea i bottoni per collegarsi ai dettagli dei conti
		this.create_account_button = function(accounts) {
	      accounts.forEach(function(account) {
			var button = document.createElement('input');
    		button.type = 'button';
    		button.value = "Account " + account.idAccount;
			button.setAttribute('idAccount',account.idAccount );
			
			button.onclick = function() {
			  idAccount = button.getAttribute("idAccount"); 
			  
			  //mostra i dettagli del conto, la lista delle transazioni e il form per l'invio'
			  accountDetails.show(idAccount);
			  accountDetails.send_form.querySelector("input[name='idAccount']").value = idAccount;
    		};

			button.href = "#";
			ac_container.appendChild(button);
	      });
	      this.ac_container.style.display = "block";
	    }

		this.autoclick = function(idAccount) {
	      var selector = "button[idAccount='" + idAccount + "']";
	      
	      //ritorna il primo elemento che da match con il selettore
	      var a = (idAccount) ? document.querySelector(selector) :  	        this.ac_container.querySelectorAll("input")[0];
	      if (a) a.dispatchEvent(new Event("click"));
	    }
		
	}
	
	function AccountDetails(info_container, div_account, div_balance, alert, 
		tr_container, tr_body, send_button, send_form, send_error) {

	    this.tr_container = tr_container;
	    this.div_account = div_account;
	    this.div_balance = div_balance;
	    this.tr_body = tr_body;
		this.info_container = info_container;
		this.alert = alert;
		this.alert.style.display = "none";
		this.send_button = send_button;
    	this.send_form = send_form;
    	this.send_error = send_error;
    	this.send_error.style.display = "none";
    	
    	this.send_form = this.send_form.querySelector("form");
    	this.user_dest = this.send_form.querySelector("input[name='userdest']");
        this.acc_dest = this.send_form.querySelector("input[name='accdest']");
        this.description = this.send_form.querySelector("input[name='description']");
        this.amount = this.send_form.querySelector("input[name='amount']");
        this.account = this.send_form.querySelector("input[name='idAccount']");
      	this.div_account.textContent = "";
		      	
      	this.show = function(idAccount) {
		  var self = this;
		  makeCall("GET", 'GetAccountDetails?idAccount=' + idAccount, null,	 
		    function(req) {
			 if (req.readyState == 4) {
				switch (req.status){
					
					case 200:
		          	  var data = JSON.parse(req.responseText);
		          	  if (data.transactions.length <= 0) {
			            self.alert.textContent = "No transactions yet!";
			            self.alert.style.display = "block";
			            self.tr_body.textContent ="";
			            self.tr_container.style.visibility = "hidden";
			            self.tr_body.style.visibility = "hidden";
					  }	
					  else{
					  self.alert.style.display = "none";
					  self.tr_container.style.visibility = "visible";
	      			  self.tr_body.style.visibility = "visible";
			          }		
			          self.create_transactions_table(data.account, data.transactions);
			          break;
		      		
		      		default:
		      		  self.alert.textContent = "Request reported status " + 
		      		  	req.status + ":" + req.responseText;
		      		  self.alert.style.display = "block";
		      		  self.tr_body.textContent ="";
			          self.tr_container.style.visibility = "hidden";
			          self.tr_body.style.visibility = "hidden";
		      		  break;
		      	}
		      }
		    }
		  );
	    }
		
		//stampa i dettagli del conto e crea la tabella con le transazioni
		this.create_transactions_table = function(account, transactions) {
			var self = this;
			
			self.balance = account.balance;
			
			self.div_balance.textContent = "Balance: " + account.balance;
			this.div_account.textContent = "Account selected: " + account.idAccount;

		  	if (transactions.length <= 0) return;
					
	      	var row, date, amount, origin, destination, description;
	      	this.tr_body.innerHTML = "";
	      	var self = this;
	      	transactions.forEach(function(transaction) {
			
			row = document.createElement("tr");
			
			date = document.createElement("td");
			date.textContent = transaction.date;			
			row.appendChild(date);
			amount = document.createElement("td");
			amount.textContent = transaction.amount;
			row.appendChild(amount);
			origin = document.createElement("td");
			origin.textContent = transaction.idOrigin;
			row.appendChild(origin);
			destination = document.createElement("td");
			destination.textContent = transaction.idDestination;
			row.appendChild(destination);
			description = document.createElement("td");
			description.textContent = transaction.description;
			row.appendChild(description);
			
			self.tr_body.appendChild(row);
			
          	self.tr_container.style.visibility = "visible";
	      	self.tr_body.style.visibility = "visible";
	      	
	      });
	  }
	     
	  //invio del form nuova transazione 
      this.send_button.addEventListener("click", () =>{ 
		if(!(this.send_form.checkValidity())){ //form check
			this.send_form.reportValidity();
			return;
		}

		//controlli addizionali
		if(this.account.value == this.acc_dest.value){
		  transactionFailed.show("Destination account must be different from origin account");
		  return;
		}else if(Number(this.amount.value) > this.balance){
		  transactionFailed.show("Insufficient balance");
		  return;
		}else if(Number(this.amount.value) <= 0){
		  transactionFailed.show("Amount is not positive");
		  return;
		}
		
		//nessun errore lato client, invia transazione
		this.send_form.style.display = "none";
	    var self = this;
		makeCall("POST", "CreateTransaction", send_button.closest("form"), 
          function(x) {
			console.log("post");
            if (x.readyState == XMLHttpRequest.DONE) {
              switch (x.status) {
                case 200:
              	  var data = JSON.parse(x.responseText);
              	  
            	  self.show(data.origAcc.idAccount);
            	  self.send_form.style.display = "none";
                  transactionConfirmation.show(data.origAcc, data.destAcc, data.transaction);
                  addressBook.check_existing_contact(data.destAcc.user, data.destAcc.idAccount) //username orig, username dest, idAcc dest
                  break;
                  
			    default:
                  transactionFailed.show(x.responseText);
                  break;
              }
            }
          });
        });

		
		
		
		this.user_dest.addEventListener("focus", (e) => {
            addressBook.autocompleteUsername(this.user_dest.value);
        });
        this.user_dest.addEventListener("keyup", e => {
            addressBook.autocompleteUsername(e.target.value);  
        });
        this.acc_dest.addEventListener("focus", e => {
            addressBook.autocompleteAccount(this.user_dest.value, e.target.value, this.account.value);
        });
        this.acc_dest.addEventListener("keyup", e => {
            addressBook.autocompleteAccount(this.user_dest.value, e.target.value, this.account.value);
        });
 
	} //fine AccountDetails
	
	function TransactionConfirmation(conf_container, conf_body) {
		this.conf_container = conf_container;
		this.conf_body = conf_body;
		
		this.show = function(origAcc, destAcc, transaction) {
			this.conf_body.innerHTML = "";
			row1 = document.createElement("tr");
			id1 = document.createElement("td");
			id1.textContent = origAcc.idAccount;			
			row1.appendChild(id1);
			old1 = document.createElement("td");
			old1.textContent = origAcc.balance;			
			row1.appendChild(old1);
			new1 = document.createElement("td");
			new1.textContent = origAcc.balance - transaction.amount;			
			row1.appendChild(new1);
			
			row2 = document.createElement("tr");
			id2 = document.createElement("td");
			id2.textContent = destAcc.idAccount;			
			row2.appendChild(id2);
			old2 = document.createElement("td");
			old2.textContent = destAcc.balance;			
			row2.appendChild(old2);
			new2 = document.createElement("td");
			new2.textContent = destAcc.balance + transaction.amount;			
			row2.appendChild(new2);
			
			this.conf_body.appendChild(row1);
			this.conf_body.appendChild(row2);
	      	this.conf_container.style.display = "block";
		}
	}
	
	function TransactionFailed(fail_container, fail_body, back_button) {
		this.fail_container = fail_container;
		this.fail_body = fail_body;
		this.back_button = back_button;
		
		this.show = function(error) {
			this.fail_body.innerHTML = "";
			
			mess = document.createElement("p");
			mess.textContent = error;
			this.fail_body.appendChild(mess);

			back_button.onclick = function() {
			  accountDetails.send_form.style.display = "block";
			  transactionFailed.fail_container.style.display = "none";
			  transactionFailed.fail_body.style.display = "none";
			};
		
			accountDetails.send_form.style.display = "none";
			this.fail_container.style.display = "block";
			this.fail_body.style.display = "block";
			this.back_button.style.display = "block";
		}
	}
	
	function AddressBook(text, button_back, button_save, button_do_not_save, userdest_datalist, accdest_datalist) {
		this.text = text;
		this.button_back = button_back;
		this.button_save = button_save;
		this.button_do_not_save = button_do_not_save;
		
		this.userdest_datalist = userdest_datalist;
      	this.accdest_datalist = accdest_datalist;
		
		this.contacts = []; 
		var self = this;	
			
		button_back.onclick = function() {
		  accountDetails.send_form.style.display = "block";
		  transactionConfirmation.conf_container.style.display = "none";
		  self.button_back.style.display = "none";
		};
		
		button_do_not_save.onclick = function() {
		  accountDetails.send_form.style.display = "block";
		  transactionConfirmation.conf_container.style.display = "none";
		  
		  self.text.style.display = "none";
		  self.button_save.style.display = "none";
		  self.button_do_not_save.style.display = "none";           
		};
		
		button_save.onclick = function() {
		  accountDetails.send_form.style.display = "block";
		  transactionConfirmation.conf_container.style.display = "none";
		  
		  self.text.style.display = "none";
		  self.button_save.style.display = "none";
		  self.button_do_not_save.style.display = "none";
		  self.addContact(self.contact_username, self.contact_account);
		};
		
		this.autocompleteUsername = function(user_dest){    	
            this.userdest_datalist.innerHTML = "";
            this.accdest_datalist.innerHTML = "";
            var users = Object.keys(self.contacts);
            
            if (!users.includes(user_dest)){
                let sim = []; // suggerimenti
                users.forEach(dest => {
                    if (String(dest).startsWith(user_dest))
                        sim.push(dest);
                });
                sim.forEach(dest => {
                    let option = document.createElement("option");
                    option.text = dest;
                    option.value = dest;
                    this.userdest_datalist.appendChild(option);
                });
            }
        };
		
		
		this.autocompleteAccount = function(user_dest, account_dest, current_account){     	
            this.userdest_datalist.innerHTML = "";
            this.accdest_datalist.innerHTML = "";
            
            var users = Object.keys(this.contacts);
            if (users.includes(user_dest)){ 
                let accounts = this.contacts[user_dest];
                if (!accounts.includes(account_dest)){
                    let sim = []; // suggerimenti
                    accounts.forEach(account => {
                        if (String(account).startsWith(account_dest) && account != current_account)
                            sim.push(account);
                    });
                    sim.forEach(account => {
                        let option = document.createElement("option");
                        option.text = account;
                        option.value = account;
                        this.accdest_datalist.appendChild(option);
                    });
                }
            }
        }
		
		this.addContact = function(contact_username, contact_account){
			var data = new FormData();
            data.append("contact_username", contact_username);
            data.append("contact_account", contact_account);
         
         	makeCall("POST", "AddContact", data, (req) => {
			if (req.readyState == 4) {
                switch(req.status){
                    case 200: //ok
                        self.load();
                        break;
                    case 400: // bad request
                    case 401: // unauthorized
                    case 500: // server error
                    	self.text.textContent = req.responseText;
                        self.text.style.display = "block";
                        break;
                }
                }
            });
		};
		
		// carica la rubrica dell'user corrente,
		// contact è: username dest - insieme di acc dest
		this.load = function(){
			makeCall("GET", "GetAddressBook", null, (req) => {
			if (req.readyState == 4) {
                switch(req.status){
                    case 200: //ok
                		self.contacts = JSON.parse(req.responseText);
                        break;
                    case 400: // bad request
                    case 401: // unauthorized
                    case 500: // server error
                    default: //Error
                        self.text.textContent = req.responseText;
                        self.text.style.display = "block";
                        break;
                }
          	}
			});
		};
              
        // controlla se il contatto esiste e mostra i bottoni corretti         
		this.check_existing_contact = function(contact_username, contact_account) { //vedere se esiste il contatto e chiedere all'utente se vuole inserire
			console.log("check: ");
			if(self.contacts[contact_username] && self.contacts[contact_username].includes(contact_account)){ //se l'username è nei contatti
                self.button_back.style.display = "block";
                self.button_save.style.display = "none";
                self.button_do_not_save.style.display = "none";
                self.text.style.display = "none";
                console.log("si");
                return;
        	}else{ //se non esiste chiedi se vuole crearlo
				self.button_back.style.display = "none";
             	self.button_save.style.display = "inline-block";
				self.button_do_not_save.style.display = "inline-block";
				self.text.style.display = "block";
				self.contact_username = contact_username;
				self.contact_account = contact_account;
				console.log("no");
				return;
            }            
        };   	
	}	
	
})();