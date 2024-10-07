import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import { Message } from '../models/message.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  db = inject(Firestore);

  constructor() { }

  private getCollectionRef(uid, pid){
    return collection(this.db, `users/${uid}/profiles/${pid}/messages`);
  }

  private getDocRef(uid, pid, mesId){
    return doc(this.db, `users/${uid}/profiles/${pid}/messages/${mesId}`);
  }

  getMessages(uid, pid){
    let messages: Message[] = []; 

    return getDocs(this.getCollectionRef(uid, pid)).then((data): Message[] => {
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
    return setDoc(this.getDocRef(uid, pid, mesId), data)
  }

  readMessage(uid, pid, mesId){
    return updateDoc(this.getDocRef(uid, pid, mesId), {
      isRead: true
    })
  }
}
