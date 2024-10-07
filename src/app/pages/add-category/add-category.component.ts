import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContainerDirective } from '../../directives/container.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { WidgetDirective } from '../../directives/widget.directive';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { CategoryService } from '../../services/category.service';

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
  authService = inject(AuthService);
  categoryService = inject(CategoryService);

  sub: Subscription;
  loggedUser: User;
  activeProfile: Profile;
  errorMsg: string = '';

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === localStorage.getItem('profileId'))!
        this.categoryService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
        })
      })
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe()
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
      this.categoryService.addCategory(this.loggedUser.uid, this.activeProfile.id, this.categoryForm.value)
      this.onGoBack()
    }
  }
}
