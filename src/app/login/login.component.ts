import { Component, ViewChild, inject } from '@angular/core';

import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { from } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonDirDirective,
    InputDirDirective,
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  db = inject(Firestore);
  router = inject(Router);
  authService = inject(AuthService)

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
      const docRef = doc(this.db, "users", data!.user?.uid!)
      let user;
      from(getDoc(docRef)).subscribe(doc => {
        user = doc
        console.log(user._document)
        if(!user._document){
          console.log('user jest nowy')
          this.createUser(data)
        }
        else {
          console.log('user jest w bazie')
        }
        this.router.navigate(['main-page']);
      })
    });
  }

  onSignInGoogle(){
    this.authService.googleAuth().subscribe((data) => {
      const docRef = doc(this.db, "users", data!.user?.uid!)
      let user;
      from(getDoc(docRef)).subscribe(doc => {
        user = doc
        console.log(user._document)
        if(!user._document){
          console.log('user jest nowy')
          this.createUser(data)
        }
        else {
          console.log('user jest w bazie')
        }
        this.router.navigate(['main-page']);
      })
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

  createUser(credential){
    const docRef = doc(this.db, "users", credential.user.uid)
    setDoc(docRef, {
      email: credential.user.email,
      profiles: [
        {
          name: 'Założyciel',
          role: 'admin',
          PIN: null,
          categories: ['jedzenie', 'transport'],
          expenses: []
        }
      ],
      accountStatus: 'free'
    })
  }

  onSubmit(){
    if(this.loginMode){
      this.authService
        .login(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: () => {
            this.router.navigate(['main-page']);
          },
          error: (error) => {
            console.log(error.code)

            this.handleError(error)
          }
        })
    }
    else{
      this.authService
        .register(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (credential) => {
            this.createUser(credential)
            this.router.navigate(['main-page']);
          },
          error: (error) => {
            console.log(error.code)

            this.handleError(error)
          }
        })
    }
  }
}
