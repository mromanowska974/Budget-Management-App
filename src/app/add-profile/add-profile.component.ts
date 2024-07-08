import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';
import { User } from '../models/user.interface';
import { v4 as uuid } from 'uuid';
import { ContainerDirective } from '../directives/container.directive';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-add-profile',
  standalone: true,
  imports: [
    ButtonDirDirective,
    InputDirDirective,
    ContainerDirective,
    
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
  dataService = inject(DataService);
  db = inject(Firestore);

  loggedUser: User;
  errorMsg: string;

  profilesLimit: number;

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.profilesLimit = this.loggedUser.accountStatus === 'free' ? 3 : 6;
        console.log(this.profilesLimit)
      })
  }

  onGoBack(){
    this.router.navigate(['main-page']);
  }

  onSubmit(){
    this.errorMsg = '';

    if(this.loggedUser.profiles.length! < this.profilesLimit 
      && ( this.profileForm.value.pinCode.toString().length >= 4
      && this.profileForm.value.pinCode.toString().length <= 8 )
      && this.loggedUser.profiles.filter(profile => profile.name === this.profileForm.value.profileName).length! === 0){

      let newProfile = {
        PIN: this.profileForm.value.pinCode.toString(),
        name: this.profileForm.value.profileName,
        role: 'user',
        monthlyLimit: 99.99,
        notificationTime: 3
      }

      this.dataService.addProfile(this.loggedUser.uid, newProfile).then(pid => {
        this.dataService.addCategory(this.loggedUser.uid, pid, {
          content: 'jedzenie',
          color: '#ff0000'
        })
        this.dataService.addCategory(this.loggedUser.uid, pid, {
          content: 'transport',
          color: '#ffff00'
        })

        this.loggedUser.profiles.push(newProfile)

        this.authService.changeUser('profiles', this.loggedUser.profiles, this.loggedUser)
        this.router.navigate(['main-page']);
      })
      
    }
    else {
      if(this.loggedUser.profiles.length! >= this.profilesLimit) this.errorMsg = 'Przekroczono limit profili'
      if(this.profileForm.value.pinCode.toString().length < 4 || this.profileForm.value.pinCode.toString().length > 8) this.errorMsg = 'Kod PIN musi zawierać od 4 do 8 cyfr.'
      if(this.loggedUser.profiles.filter(profil => profil.name === this.profileForm.value.profileName).length! > 0) this.errorMsg = "Profil o podanej nazwie już istnieje"
    }
  }
}
