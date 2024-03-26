package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Date;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.beans.Account;
import it.polimi.tiw.beans.Transaction;
import it.polimi.tiw.dao.AccountDAO;
import it.polimi.tiw.dao.TransactionDAO;
import it.polimi.tiw.utils.ConnectionHandler;
import com.google.gson.Gson;

import it.polimi.tiw.beans.User;
import it.polimi.tiw.packets.PacketTransaction;

@WebServlet("/CreateTransaction")
@MultipartConfig
public class CreateTransaction extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CreateTransaction() {
		super();
	}

	public void init() throws ServletException {
    	ServletContext servletContext = getServletContext();
		this.connection = ConnectionHandler.getConnection(servletContext);
   }

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// Get and parse all parameters from request

		Integer idOrigin = null;
		String userDestination = null;
		Integer idDestination = null;
		Double amount = null;
		String description = null;
		Date date = null;
		
		try {
			idOrigin = Integer.parseInt(request.getParameter("idAccount"));
			userDestination = request.getParameter("userdest");
			idDestination = Integer.parseInt(request.getParameter("accdest"));
			amount = Double.parseDouble(request.getParameter("amount"));
			description = request.getParameter("description");
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);		
			response.getWriter().println("Not possible to recover parameters");
			e.printStackTrace();
			return;
		}
		
		HttpSession session = request.getSession(false);
		User user = (User)session.getAttribute("user");
			
		if (userDestination == null || idDestination == null || amount == null || description == null ){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);		
			response.getWriter().println("parameters are null");
			return;
		}	
			
		AccountDAO accountDAO = new AccountDAO(connection);
	
		Account destAcc = null;
		Account origAcc = null;
		
		try {
			destAcc = accountDAO.findAccountById(idDestination);
			origAcc = accountDAO.findAccountById(idOrigin);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);		
			response.getWriter().println("Not possibile to recover parameters");
			return;
		}
		
		
        if (destAcc == null) {
        	response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Destination account does not exist");
			return;
        }
        else if (idOrigin == idDestination) {
        	response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Destination account must be different from origin account!");
			return;
        }
        else if (!(destAcc.getUser().equals(userDestination))) {
        	response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Destination account or user are not correct");
			return;
        }
        else if(!(origAcc.getUser().equals(user.getUsername()))) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Source account does not belong to the current user");
			return;
		}
        else if (amount <= 0) 	{
        	response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Amount is not positive!");
			return;
        }
        else if (amount > origAcc.getBalance()) 	{
        	response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);		
			response.getWriter().println("Insufficient balance!");
			return;
        }

		TransactionDAO transactionDAO = new TransactionDAO(connection);
		try { 
			transactionDAO.createTransaction(idOrigin, userDestination, idDestination, amount, description, date);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println(e.getMessage());
			return;	
		}


	    Transaction transaction = new Transaction();
	    transaction.setIdOrigin(origAcc.getIdAccount());
	    transaction.setIdDestination(destAcc.getIdAccount());
	    transaction.setAmount(amount);
	    transaction.setDescription(description);
		
		String json = new Gson().toJson(new PacketTransaction(origAcc, destAcc, transaction));
		
		response.setStatus(HttpServletResponse.SC_OK);	
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().println(json);
    }

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}

}