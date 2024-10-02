import { Injectable, inject } from "@angular/core";
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "@angular/fire/firestore";
import { from } from "rxjs";
import { Profile } from "../models/profile.interface";
import { AuthService } from "./auth.service";
import { Expense } from "../models/expense.interface";
import { Message } from "../models/message.interface";

@Injectable({
    providedIn: 'root'
})
export class DataService{
    db = inject(Firestore)
    authService = inject(AuthService);

    //USERS

    getUser(id: string){
        const docRef = doc(this.db, "users", id);
        return getDoc(docRef).then(data => data.data());
    }

    updateUser(id: string, propToEdit, newValue){
        const docRef = doc(this.db, "users", id);
        return from(updateDoc(docRef, {
          [propToEdit]: newValue
        }).then(() => {
          return this.getUser(id)
        }))
    }

    addUser(data){
        const docRef = doc(this.db, "users", data.user.uid)
        return setDoc(docRef, {
          email: data.user.email,
          accountStatus: 'free'
        }).then(() => {
          this.addProfile(data.user.uid).then(pid => {
            this.addCategory(data.user.uid, pid, {
              content: 'Jedzenie',
              color: '#ff0000'
            })
            this.addCategory(data.user.uid, pid, {
              content: 'Transport',
              color: '#ffff00'
            })
          })
        })
    }

    //PROFILES

    getProfiles(uid): Promise<Profile[]>{
      const profilesDoc = collection(this.db, `users/${uid}/profiles`)
      let profiles: Profile[] = []; 

      return getDocs(profilesDoc).then((data): Profile[] => {
        data.docs.forEach(profile => {
            profiles.push(
              {
                id: profile.id,
                name: profile.data()!['name'],
                role: profile.data()!['role'],
                PIN: profile.data()!['PIN'],
                monthlyLimit: profile.data()!['monthlyLimit'],
                notificationTime: profile.data()!['notificationTime'],
              }
            ) 
        })
        return profiles;
      })
    }

    getProfile(uid, pid){
      const profileDoc = doc(this.db, `users/${uid}/profiles/${pid}`)

      return getDoc(profileDoc).then(data => {
        return {
          id: data.id,
          name: data.data()!['name'],
          role: data.data()!['role'],
          PIN: data.data()!['PIN'],
          monthlyLimit: data.data()!['monthlyLimit'],
          notificationTime: data.data()!['notificationTime'],
        }
      })
    }

    addProfile(uid, data?){
      const profilesRef = collection(this.db, `users/${uid}/profiles`)

      return addDoc(profilesRef, {
          name: data ? data.name : 'Założyciel',
          role: data ? 'user' : 'admin',
          PIN: data ? data.PIN : null,
          monthlyLimit: 99.99,
          notificationTime: 3
      }).then(data => data.id)
    }

    updateProfile(uid: string, pid: string, propToEdit, newValue){
      const docRef = doc(this.db, `users/${uid}/profiles`, pid);

      return updateDoc(docRef, {
        [propToEdit]: newValue
      }).then(() => {
         return this.getProfile(uid, pid).then((profile):Profile => profile)
      })

    }

    deleteProfile(uid: string, pid: string){
      const docRef = doc(this.db, `users/${uid}/profiles/${pid}`)

      return deleteDoc(docRef)
    }

    //CATEGORIES

    getCategories(uid: string, pid: string){
      const profilesDoc = collection(this.db, `users/${uid}/profiles/${pid}/categories`)
      let categories: {id: string, content: string, color: string}[] = []; 

      return getDocs(profilesDoc).then((data): {id: string, content: string, color: string}[] => {
        data.docs.forEach(category => {
          categories.push(
              {
                id: category.id,
                content: category.data()!['content'],
                color: category.data()!['color']
              }
            ) 
        })
        return categories;
      })
    }

    getCategory(uid, pid, catId){
      const categoryRef = doc(this.db, `users/${uid}/profiles/${pid}/categories/${catId}`)

      return getDoc(categoryRef).then(data => {
        return {
          id: data.id,
          content: data.data()!['content'],
          color: data.data()!['color'],
        }
      })
    }

    addCategory(uid, pid, data){
      const categoriesRef = collection(this.db, `users/${uid}/profiles/${pid}/categories`)
      return addDoc(categoriesRef, data)
    }

    updateCategory(uid, pid, catId, data){
      const categoryRef = doc(this.db, `users/${uid}/profiles/${pid}/categories/${catId}`)

      return updateDoc(categoryRef, {
        content: data.content,
        color: data.color
      }).then(() => this.getCategory(uid, pid, catId)).then(category => category)
    }

    deleteCategory(uid, pid, catId){
      const categoryRef = doc(this.db, `users/${uid}/profiles/${pid}/categories/${catId}`)

      return deleteDoc(categoryRef)
    }

    //EXPENSES

    getExpenses(uid, pid){
      const expensesDoc = collection(this.db, `users/${uid}/profiles/${pid}/expenses`)
      let expenses: Expense[] = []; 

      return getDocs(expensesDoc).then((data): Expense[] => {
        data.docs.forEach(expense => {
          expenses.push(
              {
                id: expense.id,
                price: expense.data()!['price'],
                date: new Date(expense.data()!['date']),
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
      const expenseRef = doc(this.db, `users/${uid}/profiles/${pid}/expenses/${expId}`)

      return getDoc(expenseRef).then(data => {
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
      const expensesRef = collection(this.db, `users/${uid}/profiles/${pid}/expenses`)
      return addDoc(expensesRef, data)
    }

    updateExpense(uid, pid, expId, data){
      const expenseRef = doc(this.db, `users/${uid}/profiles/${pid}/expenses/${expId}`)

      return updateDoc(expenseRef, {
        price: +data.price,
        description: data.description,
        date: new Date(data.date).toISOString().substring(0, 10),
        isPeriodic: data.isPeriodic,
        renewalTime: data.renewalTime,
        category: data.category
      }).then(() => this.getExpense(uid, pid, expId)).then(expense => expense)
    }

    //MESSAGES

    getMessages(uid, pid){
      const messagesDoc = collection(this.db, `users/${uid}/profiles/${pid}/messages`)
      let messages: Message[] = []; 

      return getDocs(messagesDoc).then((data): Message[] => {
        data.docs.forEach(message => {
          messages.push(
              {
                id: message.id,
                title: message.data()!['title'],
                content: message.data()!['content'],
                isRead: message.data()!['isRead'],
              }
            ) 
        })
        return messages;
      })
    }

    addMessage(uid, pid, data, mesId){
      const messageRef = doc(this.db, `users/${uid}/profiles/${pid}/messages/${mesId}`)
      return setDoc(messageRef, data)
    }

    readMessage(uid, pid, mesId){
      const messageRef = doc(this.db, `users/${uid}/profiles/${pid}/messages/${mesId}`)

      return updateDoc(messageRef, {
        isRead: true
      })
    }
}