import { Component, ViewChild, inject } from '@angular/core';

import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { DataService } from '../services/data.service';

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
  authService = inject(AuthService);
  dataService = inject(DataService);

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
      let user;

      this.dataService.getUser(data!.user?.uid!).subscribe(doc => {
        user = doc
        if(!user._document){
          this.dataService.addUser(data)
        }
        else {
          if(user.data()!["profiles"].length === 1) this.router.navigate(['main-page']);
          else this.router.navigate(['profiles-panel']);
        }
      })
    });
  }

  onSignInGoogle(){
    this.authService.googleAuth().subscribe((data) => {
      let user;

      this.dataService.getUser(data!.user?.uid!).subscribe(doc => {
        user = doc
        if(!user._document){
          this.dataService.addUser(data)
        }
        else {
          if(user.data()!["profiles"].length === 1) this.router.navigate(['main-page']);
          else this.router.navigate(['profiles-panel']);
        }
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

  onSubmit(){
    if(this.loginMode){
      this.authService
        .login(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data) => {
            this.dataService.getUser(data.user.uid).subscribe(user => {
              if(user.data()!["profiles"].length === 1) this.router.navigate(['main-page']);
              else this.router.navigate(['profiles-panel']);
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
            this.dataService.addUser(credential)
            this.router.navigate(['main-page']);
          },
          error: (error) => {
            this.handleError(error)
          }
        })
    }
  }
}
