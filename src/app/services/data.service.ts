import { Injectable, inject } from "@angular/core";
import { Firestore, arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from "@angular/fire/firestore";
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
          profiles: [
            {
              id: uuid(),
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

          this.getUser(id).subscribe(user => {
            console.log(user.data())
            this.authService.setUser({
              uid: id,
              email: user.data()!['email'],
              accountStatus: user.data()!['accountStatus'],
              profiles: user.data()!['profiles'],
            })
          })
        })
      }))
    }
}