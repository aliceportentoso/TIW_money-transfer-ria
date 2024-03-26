package it.polimi.tiw.controllers;

import java.io.IOException;

import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.beans.Account;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.AddressBookDAO;
import it.polimi.tiw.dao.AccountDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/AddContact")
@MultipartConfig

public class AddContact extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;
       
    public AddContact() {
        super();
    }
    
protected void doPost(HttpServletRequest request, HttpServletResponse response) 
		throws ServletException, IOException {
	
		String contactUsername;
		Integer contactAccountId;
		
		try {
			contactUsername = request.getParameter("contact_username");
			contactAccountId = Integer.parseInt(request.getParameter("contact_account"));
			if(contactUsername == null || contactAccountId == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);		
				response.getWriter().println("Missing parameters");
				return;
			}
			
		}catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);		
			response.getWriter().println("Parameters are not correct");
			return;
		}
		
		HttpSession session = request.getSession(false);
		User user = (User)session.getAttribute("user");
		
		AccountDAO accountDAO = new AccountDAO(connection);
		Account account;
		try {
			account = accountDAO.findAccountById(contactAccountId); //cerco il conto dest
		}catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println(e.getMessage());
			return;		
		}

		if(account == null || !(account.getUser().equals(contactUsername))) { //se non esiste conto dest o il suo user non è l'user che ho io
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Parameter are inconsistent with the database info");
			return;
		}
		
		AddressBookDAO addressBookDAO = new AddressBookDAO(connection);
		boolean exists = false;
		try {
			exists = addressBookDAO.existsContact(user.getUsername(), contactAccountId); //username, account id dest esiste già
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println(e.getMessage());
			return;		
		}
		
		if(exists) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Contact already exists");
			return;
		}
		
		try {
			addressBookDAO.addContactToAddressBook(user.getUsername(), contactAccountId);
		}catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println(e.getMessage());
			return;
		}
		
		response.setStatus(HttpServletResponse.SC_OK);	
		
	}
    
    public void init() throws ServletException {
    	ServletContext servletContext = getServletContext();
		this.connection = ConnectionHandler.getConnection(servletContext);
    }
    
    public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
