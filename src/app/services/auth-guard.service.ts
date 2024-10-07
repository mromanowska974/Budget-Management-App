import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export const loggedAuthGuard: CanActivateFn = 
(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean|UrlTree> | Promise<boolean|UrlTree> => {
  const router = inject(Router);

  if(localStorage.getItem('uid')){
    return true;
  }

  return router.createUrlTree([''])
}

export const unloggedAuthGuard: CanActivateFn = 
(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean|UrlTree> | Promise<boolean|UrlTree> => {
  const router = inject(Router);

  if(!localStorage.getItem('uid')){
    return true;
  }

  return router.createUrlTree(['/main-page'])
}