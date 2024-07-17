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
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { loggedAuthGuard, unloggedAuthGuard } from './services/auth-guard.service';
import { NotificationsComponent } from './notifications/notifications.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        canActivate: [unloggedAuthGuard],
        component: LoginComponent
    },
    {
        path: 'main-page',
        component: PageContainerComponent,
        canActivate: [loggedAuthGuard],
        children: [
            {
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
            },
            {
                path: ':categoryName/preview',
                component: CategoryPageComponent
            }
        ]
    },
    {
        path: 'add-profile',
        canActivate: [loggedAuthGuard],
        component: AddProfileComponent
    },
    {
        path: 'profiles-panel',
        canActivate: [loggedAuthGuard],
        component: ProfilesComponent
    },
    {
        path: 'profile-auth',
        canActivate: [loggedAuthGuard],
        component: ProfileAuthComponent
    },
    {
        path: 'settings',
        canActivate: [loggedAuthGuard],
        component: SettingsComponent
    },
    {
        path: 'edit-profiles',
        canActivate: [loggedAuthGuard],
        component: EditProfilesComponent
    },
    {
        path: 'subscription',
        canActivate: [loggedAuthGuard],
        component: SubscriptionComponent
    },
    {
        path: 'add-category',
        canActivate: [loggedAuthGuard],
        component: AddCategoryComponent
    },
    {
        path: 'add-expense',
        canActivate: [loggedAuthGuard],
        component: AddExpenseComponent
    },
    {
        path: 'notifications',
        canActivate: [loggedAuthGuard],
        component: NotificationsComponent
    }
];
