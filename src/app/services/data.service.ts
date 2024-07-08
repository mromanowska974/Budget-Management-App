import { Injectable, inject } from "@angular/core";
import { Firestore, addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "@angular/fire/firestore";
import { from } from "rxjs";
import { Profile } from "../models/profile.interface";
import { ProfileAuthService } from "./profile-auth.service";
import { v4 as uuid } from "uuid"
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class DataService{
    db = inject(Firestore)
    profileAuth = inject(ProfileAuthService)
    authService = inject(AuthService);

    //USERS

    getUser(id: string){
        const docRef = doc(this.db, "users", id);
        return from(getDoc(docRef));
    }

    updateUser(id: string, propToEdit, newValue){
        const docRef = doc(this.db, "users", id);
        return from(updateDoc(docRef, {
          [propToEdit]: newValue
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
          console.log(profile.id)
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

    updateProfile(uid: string, pid: string, propToEdit, newValue, activeProfile: Profile){
      let newProfile = JSON.parse(JSON.stringify(activeProfile));
      newProfile[propToEdit] = newValue;

      const docRef = doc(this.db, `users/${uid}/profiles`, pid);

      return from(updateDoc(docRef, {
        [propToEdit]: newValue
      }).then(() => {
          this.profileAuth.setActiveProfile(newProfile);
      }))
    }

    //CATEGORIES

    getCategories(uid: string, pid: string){
      const profilesDoc = collection(this.db, `users/${uid}/profiles/${pid}/categories`)
      let categories: {id: string, content: string, color: string}[] = []; 

      return getDocs(profilesDoc).then((data): {id: string, content: string, color: string}[] => {
        console.log(data.docs);

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

    addCategory(uid, pid, data){
      const categoriesRef = collection(this.db, `users/${uid}/profiles/${pid}/categories`)
      return addDoc(categoriesRef, data)
    }

    //EXPENSES

    addExpense(uid, pid, data){

    }
}