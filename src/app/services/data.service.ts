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
          this.addProfile(data.user.uid)
        })
    }

    getProfiles(uid): Promise<Profile[]>{
      const profilesDoc = collection(this.db, `users/${uid}/profiles`)
      let profiles: Profile[] = []; 

      return getDocs(profilesDoc).then((data): Profile[] => {
        console.log(data.docs);

        data.docs.forEach(profile => {
          console.log(profile.id)
            profiles.push(
              {
                id: profile.id,
                name: profile.data()!['name'],
                role: profile.data()!['role'],
                categories: profile.data()!['categories'],
                PIN: profile.data()!['PIN'],
                expenses: profile.data()!['expenses'],
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
      console.log(profilesRef)

      return addDoc(profilesRef, {
          name: 'Założyciel',
          role: 'admin',
          PIN: null,
          categories: [{
            id: uuid(),
            content: 'jedzenie',
            color: '#ff0000'
          }, {
            id: uuid(),
            content: 'transport',
            color: '#ffff00'
          }],
          expenses: [],
          monthlyLimit: 99.99,
          notificationTime: 3
      })
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
}