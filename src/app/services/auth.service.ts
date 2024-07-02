import { Injectable, inject, signal } from '@angular/core';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  afAuth = inject(AngularFireAuth);
  auth = inject(Auth)

  user$ = user(this.auth);
  currentUserSig = signal<User | null | undefined>(undefined)

  private alternateAuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((data) => {
        return data
      })
      .catch((error) => {
        console.log(error)
      })
  }

  fbAuth(){
    return from(this.alternateAuthLogin(new FacebookAuthProvider));
  }

  googleAuth(){
    return from(this.alternateAuthLogin(new GoogleAuthProvider));
  }

  register(email: string, password: string){
    const promise = createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    ).then()

    return from(promise); //from() zamienia Promise na Observable
  }

  login(email: string, password: string): Observable<void>{
    const promise = signInWithEmailAndPassword(
      this.auth,
      email, 
      password
    ).then(() => {}) //trzeba zrobić pustą funkcję żeby nie wywalało błędu że to nie jest Observable<void>

    return from(promise);
  }

  logout(): Observable<void>{
    const promise = signOut(this.auth);

    return from(promise);
  }
}
