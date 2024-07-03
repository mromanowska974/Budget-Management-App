import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainPageComponent } from './main-page/main-page.component';
import { AddProfileComponent } from './add-profile/add-profile.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { ProfileAuthComponent } from './profile-auth/profile-auth.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'main-page',
        component: MainPageComponent
    },
    {
        path: 'add-profile',
        component: AddProfileComponent
    },
    {
        path: 'profiles-panel',
        component: ProfilesComponent
    },
    {
        path: 'profile-auth',
        component: ProfileAuthComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    }
];
