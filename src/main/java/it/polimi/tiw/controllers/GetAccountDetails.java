package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import it.polimi.tiw.beans.User;
import it.polimi.tiw.beans.Account;
import it.polimi.tiw.beans.Transaction;
import it.polimi.tiw.dao.AccountDAO;
import it.polimi.tiw.dao.TransactionDAO;
import it.polimi.tiw.utils.ConnectionHandler;
import it.polimi.tiw.packets.PacketAccount;

@WebServlet("/GetAccountDetails")
@MultipartConfig
public class GetAccountDetails extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GetAccountDetails() {
		super();
	}

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// get and check params
		Integer idAccount = null;
		try {
			idAccount = Integer.parseInt(request.getParameter("idAccount"));
			
		} catch (NumberFormatException | NullPointerException e) {
			// only for debugging  .printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect param values");
			return;
		}

		HttpSession session = request.getSession(false);
		User user = (User)session.getAttribute("user");
		
		// If an account with that code for the user selected exists show details
		// 1 show account details
		AccountDAO accountDAO = new AccountDAO(connection);
		Account account = null;
		
		try {
			account = accountDAO.findAccountById(idAccount);
			if (account == null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.getWriter().println("Resource not found");
				return;
			}
		}
		catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover account");
			return;
		}
		if (!(account.getUser().equals(user.getUsername()))){
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			response.getWriter().println("Account is not yours");
			return;
		}
	
		
		//2 show transaction details
		TransactionDAO transactionDAO = new TransactionDAO(connection);
		List<Transaction> transactions;
		try {
			transactions = transactionDAO.findTransactionsByAccount(idAccount);
			if (transactions == null) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Zero transaction!");
				return;
			}			
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println(e.getMessage());
			return;
		}
		
		// Redirect to Account Details Page
		String json = new Gson().toJson(new PacketAccount(account, transactions));
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	
	}

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
