package it.polimi.tiw.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import it.polimi.tiw.beans.AddressBook;


public class AddressBookDAO {

	private Connection connection;
	
	public AddressBookDAO(Connection connection) {
		this.connection = connection;
	}
	
	public AddressBook findAddressBookByUsername(String username) throws SQLException{
		AddressBook addressBook = new AddressBook();
		addressBook.setUsername(username);
		
		String performedAction = " constructing an addressbook by owner id";
		String query = "SELECT a.contact_account, b.user FROM address_book AS a JOIN "
				+ "account AS b ON a.contact_account = b.idAccount WHERE a.username = ?";
		PreparedStatement preparedStatement = null;
		ResultSet resultSet = null;
		
		try {
			preparedStatement = connection.prepareStatement(query);
			preparedStatement.setString(1, username);
			resultSet = preparedStatement.executeQuery();
			
			while(resultSet.next()) //user dest, account dest
				addressBook.newContact(resultSet.getString("user"), resultSet.getInt("contact_account"));
			
			
		}catch(SQLException e) {
			throw new SQLException("Error accessing the DB when" + performedAction);
		}finally {
			try {
				//resultSet.close();
			}catch (Exception e) {
				throw new SQLException("Error closing the result set when" + performedAction);
			}
			try {
				//preparedStatement.close();
			}catch (Exception e) {
				throw new SQLException("Error closing the statement when" + performedAction);
			}
		}
		return addressBook;
	}
	
	//mio username, suo account
	public boolean existsContact(String username, int contact_account) throws SQLException{

		boolean result = false;

		String performedAction = " determining if a contact already exists";
		String query = "SELECT * FROM address_book WHERE username = ? AND contact_account = ?";
		PreparedStatement preparedStatement = null;
		ResultSet resultSet = null;
		
		try {
			preparedStatement = connection.prepareStatement(query);
			preparedStatement.setString(1, username);
			preparedStatement.setInt(2, contact_account);
			resultSet = preparedStatement.executeQuery();
			
			if(resultSet.next()) 
				result = true;
			
			
		}catch(SQLException e) {
			throw new SQLException("Error accessing the DB when" + performedAction);
		}finally {
			try {
				//resultSet.close();
			}catch (Exception e) {
				throw new SQLException("Error closing the result set when" + performedAction);
			}
			try {
				//preparedStatement.close();
			}catch (Exception e) {
				throw new SQLException("Error closing the statement when" + performedAction);
			}
		}
		return result;
	}
	
	//inserisci mio user + suo account
	public void addContactToAddressBook(String username, int contact_account) throws SQLException {
		
		String performedAction = " adding a new entry in an address book in the database";
		String queryAddUser = "INSERT INTO address_book (username, contact_account) VALUES(?,?)";
		PreparedStatement preparedStatementAddUser = null;	
		
		try {
			preparedStatementAddUser = connection.prepareStatement(queryAddUser);
			preparedStatementAddUser.setString(1, username);
			preparedStatementAddUser.setInt(2, contact_account);
			preparedStatementAddUser.executeUpdate();
			
		}catch(SQLException e) {
			throw new SQLException("Error accessing the DB when" + performedAction);
		}finally {
			try {
				//preparedStatementAddUser.close();
			}catch (Exception e) {
				throw new SQLException("Error closing the statement when" + performedAction);
			}
		}
	}
}
