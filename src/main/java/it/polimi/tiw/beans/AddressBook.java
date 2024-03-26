package it.polimi.tiw.beans;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class AddressBook {

	private String username;
	private Map<String, Set<Integer>> contacts = new HashMap<>(); // <dest username, list of accounts in contacts>
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public Map<String, Set<Integer>> getContacts() {
		return new HashMap<>(contacts);
	}	
	
	//dest username, id account dei miei contatti
	public void newContact(String contact_username, int contact_account) {
		if(contacts.containsKey(contact_username)) {
			contacts.get(contact_username).add(contact_account);
		}else {
			Set<Integer> set = new HashSet<>();
			set.add(contact_account);
			contacts.put(contact_username, set);
		}
	}
}
