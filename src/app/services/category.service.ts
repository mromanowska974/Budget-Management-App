import { EventEmitter, inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  db = inject(Firestore);
  categoryWasEdited = new BehaviorSubject<any>(null);
  categoryWasSwitched = new BehaviorSubject<any>(null);
  
  constructor() { }
  
  private getCollectionRef(uid, pid){
    return collection(this.db, `users/${uid}/profiles/${pid}/categories`);
  }

  private getDocRef(uid, pid, catId){
    return doc(this.db, `users/${uid}/profiles/${pid}/categories/${catId}`);
  }

  getCategories(uid: string, pid: string){
    let categories: {id: string, content: string, color: string}[] = []; 

    return from(getDocs(this.getCollectionRef(uid, pid)).then((data): {id: string, content: string, color: string}[] => {
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
    }))
  }

  getCategory(uid, pid, catId){
    return from(getDoc(this.getDocRef(uid, pid, catId)).then(data => {
      return {
        id: data.id,
        content: data.data()!['content'],
        color: data.data()!['color'],
      }
    }))
  }

  addCategory(uid, pid, data){
    return from(addDoc(this.getCollectionRef(uid, pid), data));
  }

  updateCategory(uid, pid, catId, data){
    return from(updateDoc(this.getDocRef(uid, pid, catId), {
      content: data.content,
      color: data.color
    }).then(() => this.getCategory(uid, pid, catId)));
  }

  deleteCategory(uid, pid, catId){
    return from(deleteDoc(this.getDocRef(uid, pid, catId)));
  }
}
