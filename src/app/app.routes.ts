import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainPageComponent } from './main-page/main-page.component';
import { AddProfileComponent } from './add-profile/add-profile.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { ProfileAuthComponent } from './profile-auth/profile-auth.component';
import { SettingsComponent } from './settings/settings.component';
import { EditProfilesComponent } from './edit-profiles/edit-profiles.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { AddCategoryComponent } from './add-category/add-category.component';
import { CategoryPageComponent } from './category-page/category-page.component';
import { PageContainerComponent } from './page-container/page-container.component';

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
        component: PageContainerComponent,
        children: [{
            path: '',
            component: MainPageComponent
        },
        {
            path: ':categoryName',
            component: CategoryPageComponent
        },
        {
            path: 'preview/:profileId',
            component: MainPageComponent
        }]
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
    },
    {
        path: 'edit-profiles',
        component: EditProfilesComponent
    },
    {
        path: 'subscription',
        component: SubscriptionComponent
    },
    {
        path: 'add-category',
        component: AddCategoryComponent
    }
];
