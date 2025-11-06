import { CanActivateFn, Router } from '@angular/router';
import { get } from '../utility/sessionStorage';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  
  var router=inject(Router);
  var authService=inject(AuthService);

  return authService.loadUser().pipe(
      map(user => {
        if (user) return true;
        authService.logOut();
        return false;
      })
    );
};


