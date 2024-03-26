package it.polimi.tiw.packets;

import it.polimi.tiw.beans.Account;
import it.polimi.tiw.beans.Transaction;

public class PacketTransaction {

	private Account destAcc;
	private Account origAcc;
	private Transaction transaction;
	
	public PacketTransaction(Account origAcc, Account destAcc, Transaction transaction) {
		super();
		this.origAcc = origAcc;
		this.destAcc = destAcc;
		this.transaction = transaction;
	}

	public Account getOriginAccount() {
		return origAcc;
	}


	public Account getDestinationAccount() {
		return destAcc;
	}


	public Transaction getTransaction() {
		return transaction;
	}	
	
}
