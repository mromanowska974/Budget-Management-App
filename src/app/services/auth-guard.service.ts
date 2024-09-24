import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export const loggedAuthGuard: CanActivateFn = 
(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean|UrlTree> | Promise<boolean|UrlTree> => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  if(localStorageService.getItem('uid')){
    return true;
  }

  return router.createUrlTree([''])
}

export const unloggedAuthGuard: CanActivateFn = 
(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean|UrlTree> | Promise<boolean|UrlTree> => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  if(!localStorageService.getItem('uid')){
    return true;
  }

  return router.createUrlTree(['/main-page'])
}