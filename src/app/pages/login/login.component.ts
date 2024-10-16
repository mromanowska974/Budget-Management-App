import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';

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
import { Subscription } from 'rxjs';

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
export class LoginComponent implements OnInit, OnDestroy{
  db = inject(Firestore);
  router = inject(Router);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  userService = inject(UserService);

  @ViewChild('f') signupForm: NgForm;
  loginMode = false;
  errorMessage: string;

  fbSub: Subscription;
  googleSub: Subscription;

  ngOnInit(): void {
    if(this.router.url === '/register') this.loginMode = false;
    else this.loginMode = true;
  }

  ngOnDestroy(): void {
    if(this.fbSub) this.fbSub.unsubscribe();
    if(this.googleSub) this.googleSub.unsubscribe();
  }

  onSignInFB(){
    this.fbSub = this.authService.fbAuth().subscribe((data) => {
      this.handleAlternateSignIn(data);
    });
  }

  onSignInGoogle(){
    this.googleSub = this.authService.googleAuth().subscribe((data) => {
      this.handleAlternateSignIn(data);
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
      localStorage.setItem('uid', uid);
  
      if(user.profiles.length === 1) localStorage.setItem('profileId', user.profiles[0].id);
  }

  handleAlternateSignIn(data){
    let userDoc;

    this.userService.getUser(data!.user?.uid!).subscribe(doc => {
      userDoc = doc;
      console.log(doc);
      if(!userDoc){
        this.userService.addUser(data).subscribe(() => {
          this.userService.getUser(data!.user?.uid!).subscribe(userDoc => {
            this.profileService.getProfiles(data!.user.uid).subscribe(profile => {
              this.setActiveUser(userDoc, data!.user?.uid!, profile);
              this.router.navigate(['main-page']);
            })
          })
        }); 
      }
      else {
        this.profileService.getProfiles(data.user.uid).subscribe(profiles => {
          this.setActiveUser(userDoc, data!.user?.uid!, profiles);
          if(profiles.length === 1) this.router.navigate(['main-page']);
          else this.router.navigate(['profiles-panel']);
        })
      }
    })
  }

  onSubmit(){
    if(this.loginMode){
      this.authService
        .login(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data) => {
            this.userService.getUser(data.user.uid).subscribe(user => {
              this.profileService.getProfiles(data.user.uid).subscribe(profiles => {
                this.setActiveUser(user, data.user.uid, profiles);
                if(profiles.length === 1) this.router.navigate(['main-page']);
                else this.router.navigate(['profiles-panel']);
              })
            })
          },
          error: (error) => {
            this.handleError(error);
          }
        })
    }
    else{
      this.authService
        .register(this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (credential) => {
            this.userService.addUser(credential).subscribe(() => {
              this.userService.getUser(credential!.user?.uid!).subscribe(doc => {
                let loggedUser = doc;
  
                this.profileService.getProfiles(credential.user.uid).subscribe(profiles => {
                  this.setActiveUser(loggedUser, credential!.user?.uid!, profiles)
                  this.router.navigate(['main-page']);
                })
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
