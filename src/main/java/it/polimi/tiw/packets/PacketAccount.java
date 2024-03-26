package it.polimi.tiw.packets;

import java.util.List;
import it.polimi.tiw.beans.Account;
import it.polimi.tiw.beans.Transaction;

public class PacketAccount {

	private Account account;
	private List<Transaction> transactions;
	
	public PacketAccount(Account account, List<Transaction> transactions){
		this.account = account;
		this.transactions = transactions;
	}
	
	public Account getAccount(){
		return this.account;
	}

	public List<Transaction> getTransfers(){
		return this.transactions;
	}
}
