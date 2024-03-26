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

import com.google.gson.Gson;
import it.polimi.tiw.beans.AddressBook;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.AddressBookDAO;
import it.polimi.tiw.utils.ConnectionHandler;


@WebServlet("/GetAddressBook")
@MultipartConfig
public class GetAddressBook extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

    public GetAddressBook() {
        super();
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

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		HttpSession session = request.getSession(false);
		User user = (User)session.getAttribute("user");
		
		AddressBookDAO addressBookDAO = new AddressBookDAO(connection);
		AddressBook addressBook;
		
		try {
			addressBook = addressBookDAO.findAddressBookByUsername(user.getUsername());
		}catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println(e.getMessage());
			return;
		}
		
		String json = new Gson().toJson(addressBook.getContacts());
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);

	}
}
