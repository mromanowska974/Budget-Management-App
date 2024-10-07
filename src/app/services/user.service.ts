import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { ProfileService } from './profile.service';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  db = inject(Firestore);
  profileService = inject(ProfileService);
  categoryService = inject(CategoryService);

  constructor() { }

  private getDocRef(uid){
    return doc(this.db, `users/${uid}`);
  }

  getUser(id: string){
      return getDoc(this.getDocRef(id)).then(data => data.data());
  }

  updateUser(id: string, propToEdit, newValue){
      return from(updateDoc(this.getDocRef(id), {
        [propToEdit]: newValue
      }).then(() => {
        return this.getUser(id)
      }))
  }

  addUser(data){
      return setDoc(this.getDocRef(data.user.uid), {
        email: data.user.email,
        accountStatus: 'free'
      }).then(() => {
        this.profileService.addProfile(data.user.uid).then(pid => {
          this.categoryService.addCategory(data.user.uid, pid, {
            content: 'Jedzenie',
            color: '#ff0000'
          })
          this.categoryService.addCategory(data.user.uid, pid, {
            content: 'Transport',
            color: '#ffff00'
          })
        })
      })
  }
}
