import { Component, OnInit, ViewChild, inject } from '@angular/core';

import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../../models/user.interface';
import { ContainerDirective } from '../../directives/container.directive';
import { ProfileService } from '../../services/profile.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonDirDirective,
    InputDirDirective,
    ContainerDirective,
    
    FormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  db = inject(Firestore);
  router = inject(Router);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  userService = inject(UserService);

  @ViewChild('f') signupForm: NgForm;
  loginMode = false;
  errorMessage: string;

  ngOnInit(): void {
    if(this.router.url === '/register') this.loginMode = false;
    else this.loginMode = true;
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

  private setActiveUser(userDoc, uid, profiles?){
      let user: User = {
        uid: uid,
        email: userDoc.email,
        accountStatus: userDoc.accountStatus,
        profiles: profiles,
      }
  
      this.authService.setUser(user);
      this.saveToLocalStorage('uid', uid);
  
      if(user.profiles.length === 1) this.saveToLocalStorage('profileId', user.profiles[0].id);
  }

  handleAlternateSignIn(data){
    let userDoc;

    this.userService.getUser(data!.user?.uid!).then(doc => {
      userDoc = doc
      if(!userDoc){
        this.userService.addUser(data).then(() => {
          this.userService.getUser(data!.user?.uid!).then(userDoc => {
            this.profileService.getProfiles(data!.user.uid).subscribe(profile => {
              this.setActiveUser(userDoc, data!.user?.uid!, profile);
              this.router.navigate(['main-page']);
            })
          })
        });
        
      }
      else {
        if(data.profiles.length === 1) this.router.navigate(['main-page']);
        else this.router.navigate(['profiles-panel']);
        this.setActiveUser(userDoc, data!.user?.uid!);
      }
    })
  }

  saveToLocalStorage(key, value) {
    localStorage.setItem(key, value);
  }

  onSubmit(){
    if(this.loginMode){
      this.authService
        .login(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data) => {
            this.userService.getUser(data.user.uid).then(user => {
              this.setActiveUser(user, data.user.uid, user!['profiles']);
              if(user!['profiles'].length === 1) this.router.navigate(['main-page']);
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
            this.userService.addUser(credential).then(() => {
              this.userService.getUser(credential!.user?.uid!).then(doc => {
                let loggedUser = doc
  
                this.setActiveUser(loggedUser, credential!.user?.uid!, loggedUser!['profiles'])
                this.router.navigate(['main-page']);
              })
            })
          },
          error: (error) => {
            this.handleError(error)
          }
        })
    }
  }

  onResetPassword(){
    this.authService.resetPassword(this.signupForm.value.email).then(() => {
      alert('Wiadomość z resetem hasła została wysłana na twój adres e-mail.')
    }).catch(err => {
      this.errorMessage = 'Proszę najpierw podać adres e-mail.'
    })
  }
}
