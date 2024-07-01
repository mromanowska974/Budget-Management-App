import { Injectable, signal } from '@angular/core';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = user(this.auth);
  currentUserSig = signal<User | null | undefined>(undefined)

  constructor(private afAuth: AngularFireAuth, private auth: Auth) { }

  private alternateAuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then(() => {
        console.log("zalogowano pomyślnie")
      })
      .catch((error) => {
        console.log(error)
      })
  }

  fbAuth(){
    return this.alternateAuthLogin(new FacebookAuthProvider);
  }

  googleAuth(){
    return this.alternateAuthLogin(new GoogleAuthProvider);
  }

  register(email: string, password: string): Observable<void>{
    const promise = createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    ).then(response => updateProfile(response.user, {displayName: 'Założyciel'}))

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
