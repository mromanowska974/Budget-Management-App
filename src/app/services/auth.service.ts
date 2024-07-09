import { Injectable, inject } from '@angular/core';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  afAuth = inject(AngularFireAuth);
  auth = inject(Auth);

  user = new BehaviorSubject<User|null>(null);

  setUser(loggedUser: User | null){
    this.user.next(loggedUser)
  }

  changeUser(propToChange, newValue, user: User){
    user[propToChange] = newValue;
    this.setUser(user);
  }

  changeProfiles(user: User, newProfile){
    const index = user.profiles.indexOf(user.profiles.find(profile => profile.id === newProfile.id)!);
    user.profiles[index] = newProfile;

    this.setUser(user);
  }

  deleteProfile(user: User, profileId){
    user.profiles = user.profiles.filter(profile => profile.id !== profileId);
    this.setUser(user)
  }

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

  login(email: string, password: string){
    const promise = signInWithEmailAndPassword(
      this.auth,
      email, 
      password
    ).then()

    return from(promise);
  }

  logout(): Observable<void>{
    const promise = signOut(this.auth);

    this.setUser(null)

    return from(promise);
  }
}
