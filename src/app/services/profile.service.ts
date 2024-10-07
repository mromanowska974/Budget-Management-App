import { inject, Injectable } from '@angular/core';
import { Profile } from '../models/profile.interface';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  db = inject(Firestore);

  constructor() { }

  private getCollectionRef(uid){
    return collection(this.db, `users/${uid}/profiles`);
  }

  private getDocRef(uid, pid){
    return doc(this.db, `users/${uid}/profiles/${pid}`);
  }

  getProfiles(uid): Promise<Profile[]>{
    let profiles: Profile[] = []; 

    return getDocs(this.getCollectionRef(uid)).then((data): Profile[] => {
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
    return getDoc(this.getDocRef(uid, pid)).then(data => {
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
    return addDoc(this.getCollectionRef(uid), {
        name: data ? data.name : 'Założyciel',
        role: data ? 'user' : 'admin',
        PIN: data ? data.PIN : null,
        monthlyLimit: 99.99,
        notificationTime: 3
    }).then(data => data.id)
  }

  updateProfile(uid: string, pid: string, propToEdit, newValue){
    return updateDoc(this.getDocRef(uid, pid), {
      [propToEdit]: newValue
    }).then(() => {
       return this.getProfile(uid, pid).then((profile):Profile => profile)
    })

  }

  deleteProfile(uid: string, pid: string){
    return deleteDoc(this.getDocRef(uid, pid))
  }
}
