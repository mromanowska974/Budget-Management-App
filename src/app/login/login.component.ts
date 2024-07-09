import { Component, ViewChild, inject } from '@angular/core';

import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { DataService } from '../services/data.service';
import { User } from '../models/user.interface';
import { ProfileAuthService } from '../services/profile-auth.service';
import { LocalStorageService } from '../services/local-storage.service';
import { ContainerDirective } from '../directives/container.directive';
import { Profile } from '../models/profile.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonDirDirective,
    InputDirDirective,
    ContainerDirective,
    
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  db = inject(Firestore);
  router = inject(Router);
  authService = inject(AuthService);
  profileAuth = inject(ProfileAuthService);
  dataService = inject(DataService);
  localStorageService = inject(LocalStorageService);

  @ViewChild('f') signupForm: NgForm;
  loginMode = false;
  errorMessage: string;

  onLogin(){
    this.loginMode = true;
  }

  onSignUp(){
    this.loginMode = false;
  }

  onSignInFB(){
    this.authService.fbAuth().subscribe((data) => {
      this.handleAlternateSignIn(data);
    });
  }

  onSignInGoogle(){
    this.authService.googleAuth().subscribe((data) => {
      this.handleAlternateSignIn(data)
    });
  }

  handleError(error){
    switch(error.code){
      case 'auth/invalid-email':
        this.errorMessage = 'Proszę podać e-mail';
        break;
      case 'auth/invalid-credential':
        this.errorMessage = 'Nieprawidłowe dane logowania';
        break;
      case 'auth/email-already-in-use':
        this.errorMessage = 'E-mail jest już zarejestrowany';
        break;
      case 'auth/missing-password':
        this.errorMessage = 'Proszę podać hasło';
        break;
      default:
        this.errorMessage = 'Nie można zalogować'
    }
  }

  setActiveUser(doc, uid){
      return this.dataService.getProfiles(uid).then(data => {
        let user: User = {
          uid: uid,
          email: doc.data()!['email'],
          accountStatus: doc.data()!['accountStatus'],
          profiles: data,
        }
    
        this.authService.setUser(user);
        this.saveToLocalStorage('uid', uid)
    
        if(user.profiles.length === 1) this.saveToLocalStorage('profileId', user.profiles[0].id)

        return user;
      }) 
  }

  handleAlternateSignIn(data){
    let userDoc;

    this.dataService.getUser(data!.user?.uid!).then(doc => {
      userDoc = doc

      if(!userDoc._document){
        this.dataService.addUser(data).then(() => {
          this.dataService.getUser(data!.user?.uid!).then(doc => {
            let loggedUser = doc

            this.setActiveUser(loggedUser, data!.user?.uid!).then(() => {
              this.router.navigate(['main-page'])
            });
          })
        });
        
      }
      else {
        this.setActiveUser(userDoc, data!.user?.uid!).then(data => {
          if(data.profiles.length === 1) this.router.navigate(['main-page']);
          else this.router.navigate(['profiles-panel']);
        });

      }
    })
  }

  saveToLocalStorage(key, value) {
    this.localStorageService.setItem(key, value);
  }

  onSubmit(){
    if(this.loginMode){
      this.authService
        .login(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data) => {
            this.dataService.getUser(data.user.uid).then(user => {
              this.setActiveUser(user, data.user.uid).then(data => {
                if(data.profiles.length === 1) this.router.navigate(['main-page']);
                else this.router.navigate(['profiles-panel']);
              });

            })
          },
          error: (error) => {
            this.handleError(error)
          }
        })
    }
    else{
      this.authService
        .register(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (credential) => {
            this.dataService.addUser(credential).then(() => {
              this.dataService.getUser(credential!.user?.uid!).then(doc => {
                let loggedUser = doc
  
                this.setActiveUser(loggedUser, credential!.user?.uid!).then(() => {
                  this.router.navigate(['main-page']);
                });
              })
            })
          },
          error: (error) => {
            this.handleError(error)
          }
        })
    }
  }
}
