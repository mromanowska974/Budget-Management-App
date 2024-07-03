import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { User } from '../models/user.interface';

@Component({
  selector: 'app-add-profile',
  standalone: true,
  imports: [
    ButtonDirDirective,
    InputDirDirective,
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-profile.component.html',
  styleUrl: './add-profile.component.css'
})
export class AddProfileComponent implements OnInit{
  @ViewChild('f') profileForm: NgForm;
  router = inject(Router);
  authService = inject(AuthService);
  db = inject(Firestore)

  currentUser: User | null = null;
  newProfile: Profile;
  errorMsg: string;

  profilesLimit = this.currentUser?.accountStatus === 'free' ? 3 : 6;

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.currentUser = user
      })
  }

  onGoBack(){
    this.router.navigate(['main-page']);
  }

  onSubmit(){
    this.errorMsg = '';

    if(this.currentUser?.profiles.length! < this.profilesLimit 
      && ( this.profileForm.value.pinCode.toString().length >= 4
      && this.profileForm.value.pinCode.toString().length <= 8 )
      && this.currentUser?.profiles.filter(profil => profil.name === this.profileForm.value.profileName).length! === 0){
      this.newProfile = {
        PIN: this.profileForm.value.pinCode,
        name: this.profileForm.value.profileName,
        role: 'user',
        categories: [{
          content: 'jedzenie',
          color: '#ff0000'
        }, {
          content: 'transport',
          color: '#ffff00'
        }],
        expenses: []
      }
  
      this.currentUser?.profiles.push(this.newProfile);

      const docRef = doc(this.db, "users", this.currentUser?.uid!);
      updateDoc(docRef, {
        profiles: this.currentUser?.profiles
      }).then(() => {
        this.onGoBack();
      })

    }
    else {
      if(this.currentUser?.profiles.length! >= this.profilesLimit) this.errorMsg = 'Przekroczono limit profili'
      if(this.profileForm.value.pinCode.toString().length < 4 || this.profileForm.value.pinCode.toString().length > 8) this.errorMsg = 'Kod PIN musi zawierać od 4 do 8 cyfr.'
      if(this.currentUser?.profiles.filter(profil => profil.name === this.profileForm.value.profileName).length! > 0) this.errorMsg = "Profil o podanej nazwie już istnieje"
    }
  }
}
