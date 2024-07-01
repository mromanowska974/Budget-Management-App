import { Component, ViewChild } from '@angular/core';

import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  @ViewChild('f') signupForm: NgForm;
  loginMode = false;
  errorMessage: string;

  constructor(
    private router: Router, 
    private authService: AuthService
  ){}

  onLogin(){
    this.loginMode = true;
  }

  onSignUp(){
    this.loginMode = false;
  }

  onSignInFB(){
    this.authService.fbAuth().then(() => {
      this.router.navigate(['main-page']);
    });
  }

  onSignInGoogle(){
    this.authService.googleAuth().then(() => {
      this.router.navigate(['main-page']);
    });
  }

  onSubmit(){
    console.log(this.signupForm.value)
    if(this.loginMode){
      this.authService
        .login(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: () => {
            this.router.navigate(['main-page']);
          },
          error: (error) => {
            this.errorMessage = error.code;
          }
        })
    }
    else{
      this.authService
        .register(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: () => {
            this.router.navigate(['main-page']);
          },
          error: (error) => {
            this.errorMessage = error.code;
          }
        })
    }
  }
}
