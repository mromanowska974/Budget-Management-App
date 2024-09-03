import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    ContainerDirective,
    ButtonDirDirective,
    InputDirDirective,
    WidgetDirective,

    FormsModule,
    CommonModule
  ],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.css'
})
export class AddCategoryComponent implements OnInit, OnDestroy{
  @ViewChild('categoryForm') categoryForm: NgForm;

  router = inject(Router);
  dataService = inject(DataService);
  authService = inject(AuthService);
  localStorageService = inject(LocalStorageService);

  sub: Subscription;
  loggedUser: User;
  activeProfile: Profile;
  errorMsg: string = '';

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.localStorageService.getItem('profileId'))!
        this.dataService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
        })
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe()
  }

  onInputChange(){
    this.errorMsg = '';
  }

  onGoBack(){
    this.router.navigate(['main-page'])
  }

  onSubmit(){
    if(this.categoryForm.value.content.length === 0 || this.categoryForm.value.color.length === 0){
      this.errorMsg = 'Proszę podać prawidłowe dane.'
    }
    else if(this.activeProfile.categories?.find(category => category.content === this.categoryForm.value.content)){
      this.errorMsg = 'Kategoria o podanej nazwie już istnieje.'
    }
    else if(this.activeProfile.categories?.find(category => category.color === this.categoryForm.value.color)){
      this.errorMsg = 'Kategoria o podanym kolorze już istnieje.'
    }
    else{
      this.dataService.addCategory(this.loggedUser.uid, this.activeProfile.id, this.categoryForm.value)
      this.onGoBack()
    }
  }
}
