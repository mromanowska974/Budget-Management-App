import { Injectable, inject } from "@angular/core";
import { Firestore, arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from "@angular/fire/firestore";
import { from } from "rxjs";
import { Profile } from "../models/profile.interface";
import { ProfileAuthService } from "./profile-auth.service";

@Injectable({
    providedIn: 'root'
})
export class DataService{
    db = inject(Firestore)
    profileAuth = inject(ProfileAuthService)

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
          profiles: [
            {
              name: 'Założyciel',
              role: 'admin',
              PIN: null,
              categories: [{
                content: 'jedzenie',
                color: '#ff0000'
              }, {
                content: 'transport',
                color: '#ffff00'
              }],
              expenses: []
            }
          ],
          accountStatus: 'free'
        })
    }

    addProfile(){

    }

    updateProfile(id: string, propToEdit, newValue, activeProfile: Profile){
      let newProfile = JSON.parse(JSON.stringify(activeProfile));
      newProfile[propToEdit] = newValue;

      const docRef = doc(this.db, "users", id);
      return from(updateDoc(docRef, {
        profiles: arrayRemove(activeProfile),
      }).then(() => {
        updateDoc(docRef, {
          profiles: arrayUnion(newProfile)
        }).then(() => {
          this.profileAuth.setActiveProfile(newProfile);
        })
      }))
    }
}