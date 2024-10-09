import { EventEmitter, inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { Expense } from '../models/expense.interface';
import { addDoc } from 'firebase/firestore';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  db = inject(Firestore);
  expenseWasEdited = new EventEmitter();

  constructor() { }

  private getCollectionRef(uid, pid){
    return collection(this.db, `users/${uid}/profiles/${pid}/expenses`);
  }

  private getDocRef(uid, pid, expId){
    return doc(this.db, `users/${uid}/profiles/${pid}/expenses/${expId}`);
  }

  getExpenses(uid, pid){
    let expenses: Expense[] = []; 

    return getDocs(this.getCollectionRef(uid, pid)).then((data): Expense[] => {
      data.docs.forEach(expense => {
        expenses.push(
            {
              id: expense.id,
              price: expense.data()!['price'],
              date: expense.data()!['date'],
              description: expense.data()!['description'],
              isPeriodic: expense.data()!['isPeriodic'],
              renewalTime: expense.data()!['renewalTime'],
              category: expense.data()!['category'],
            }
          ) 
      })
      return expenses;
    })
  }

  getExpense(uid, pid, expId){
    return getDoc(this.getDocRef(uid, pid, expId)).then(data => {
      return {
        id: data.id,
        price: data.data()!['price'],
        description: data.data()!['description'],
        date: data.data()!['date'],
        isPeriodic: data.data()!['isPeriodic'],
        renewalTime: data.data()!['renewalTime'],
        category: data.data()!['category']
      }
    })
  }

  addExpense(uid, pid, data){
    return addDoc(this.getCollectionRef(uid, pid), data)
  }

  updateExpense(uid, pid, expId, data){
    return updateDoc(this.getDocRef(uid, pid, expId), {
      price: +data.price,
      description: data.description,
      date: new Date(data.date).toISOString().substring(0, 10),
      isPeriodic: data.isPeriodic,
      renewalTime: data.renewalTime,
      category: data.category
    }).then(() => this.getExpense(uid, pid, expId)).then(expense => expense)
  }
}
