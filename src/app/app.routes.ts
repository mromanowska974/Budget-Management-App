import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { loggedAuthGuard, unloggedAuthGuard } from './services/auth-guard.service';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { PageContainerComponent } from './pages/page-container/page-container.component';
import { CategoryPageComponent } from './pages/category-page/category-page.component';
import { AddProfileComponent } from './pages/add-profile/add-profile.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { ProfileAuthComponent } from './pages/profile-auth/profile-auth.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { EditProfilesComponent } from './pages/edit-profiles/edit-profiles.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';
import { AddCategoryComponent } from './pages/add-category/add-category.component';
import { AddExpenseComponent } from './pages/add-expense/add-expense.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

export const routes: Routes = [
    {
        path: '',
        canActivate: [unloggedAuthGuard],
        component: WelcomePageComponent
    },
    {
        path: 'about',
        canActivate: [unloggedAuthGuard],
        component: AboutPageComponent
    },
    {
        path: 'login',
        canActivate: [unloggedAuthGuard],
        component: LoginComponent
    },
    {
        path: 'register',
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
