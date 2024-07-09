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

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!

        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.localStorageService.getItem('profileId'))!
      })
  }

  ngOnDestroy(): void {
      
  }

  onGoBack(){
    this.router.navigate(['main-page'])
  }

  onSubmit(){
    console.log(this.categoryForm.value)
    this.dataService.addCategory(this.loggedUser.uid, this.activeProfile.id, this.categoryForm.value)
    this.onGoBack()
  }
}
