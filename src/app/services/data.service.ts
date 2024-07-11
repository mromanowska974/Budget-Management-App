import { Injectable, inject } from "@angular/core";
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "@angular/fire/firestore";
import { from } from "rxjs";
import { Profile } from "../models/profile.interface";
import { AuthService } from "./auth.service";

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
              content: 'jedzenie',
              color: '#ff0000'
            })
            this.addCategory(data.user.uid, pid, {
              content: 'transport',
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
          //expenses: [], -> tu też będzie kolekcja
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

    addExpense(uid, pid, data){

    }
}