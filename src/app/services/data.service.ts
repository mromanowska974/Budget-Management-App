import { Injectable, inject } from "@angular/core";
import { Firestore, doc, getDoc, setDoc } from "@angular/fire/firestore";
import { from } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DataService{
    db = inject(Firestore)

    getUser(id: string){
        const docRef = doc(this.db, "users", id);
        return from(getDoc(docRef));
    }

    updateUser(){

    }

    addUser(data){
        const docRef = doc(this.db, "users", data.user.uid)
        setDoc(docRef, {
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
}