import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { LocalStorageService } from '../services/local-storage.service';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { ModalService } from '../services/modal.service';
import { InputDirDirective } from '../directives/input-dir.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    ContainerDirective,
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,

    CommonModule
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit{
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;
  @ViewChild('color') newColor;
  @ViewChild('content') newContent;

  localStorageService = inject(LocalStorageService);
  authService = inject(AuthService);
  dataService = inject(DataService);
  modalService = inject(ModalService);
  router = inject(Router);

  loggedUser: User;
  activeProfile: Profile;
  activeCategory: {id, content: string, color: string};

  isLoaded = false;
  action: string = '';
  actionMsg: string = '';
  errorMsg: string = '';
  previewMode: boolean;

  ngOnInit(): void {
    const catId = this.localStorageService.getItem('categoryId');
    const pid = this.localStorageService.getItem('profileId');
    const uid = this.localStorageService.getItem('uid');
    const previewedId = this.localStorageService.getItem('previewedProfileId');

    this.dataService.getUser(uid!).then(user => {
      this.dataService.getProfiles(uid).then(profiles => {
        this.loggedUser = {
          uid: uid!,
          accountStatus: user!['accountStatus'],
          email: user!['email'],
          profiles: profiles 
        }

        if(previewedId){
          this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === previewedId)!;
          this.dataService.getCategories(uid!, previewedId!).then(categories => {
            this.activeProfile.categories = categories;
            this.activeCategory = this.activeProfile.categories!.find(category => category.id === catId)!
            this.previewMode = true;
            this.isLoaded = true
          })
        }
        else {
          this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === pid)!;
          this.dataService.getCategories(uid!, pid!).then(categories => {
            this.activeProfile.categories = categories;
            this.activeCategory = this.activeProfile.categories!.find(category => category.id === catId)!
            this.previewMode = false
            this.isLoaded = true
          })
        }
        
      })
    })
  }

  onEditCategory(template){
    this.action = 'edit';
    this.actionMsg = "Edytuj kategorię"
    this.modalService.openModal(this.modalRef, template)
  }

  onDeleteCategory(template){
    this.action = 'delete';
    this.actionMsg = "Czy na pewno chcesz usunąć: "+this.activeCategory.content+"?";
    this.modalService.openModal(this.modalRef, template)
  }

  onCloseModal(){
    this.modalService.closeModal(this.modalRef)
  }

  onSubmitModal(){
    if (this.action === 'edit'){
      if(this.newColor.nativeElement.value === this.activeCategory.color && this.newContent.nativeElement.value === this.activeCategory.content){
        this.errorMsg = 'Proszę zmienić co najmniej jedno pole.'
      }
      else {
        this.dataService.updateCategory(this.loggedUser.uid, this.activeProfile.id, this.activeCategory.id, {
          content: this.newContent.nativeElement.value,
          color: this.newColor.nativeElement.value
        }).then(data => {
          this.authService.changeCategory(this.loggedUser, this.activeProfile.id, data)
          this.onCloseModal()
          window.location.reload()
        })
      }
    }
    else {
      if(this.activeProfile.categories!.length > 2){
        this.dataService.deleteCategory(this.loggedUser.uid, this.activeProfile.id, this.activeCategory.id).then(() => {
          this.router.navigate(['main-page']);
        })
      }
      else {
        this.errorMsg = 'Profil musi mieć co najmniej 2 kategorie.'
      }
    }
  }
}
