import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";  
import { AuthService } from "./login_signup.service";
import Swal from 'sweetalert2'
import { IfStmt } from '@angular/compiler';
  
  @Injectable()
  export class EditGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): boolean | Observable<boolean> | Promise<boolean> {
      const isAuth = this.authService.getIsAuth();
      const userrole = localStorage.getItem("role");
      var userallowed;
      if( ( userrole == 'admin' || userrole == 'user' || userrole == 'editor' )  && isAuth) 
      {
        userallowed = true;        
      }      

      if(userrole == 'manager' && isAuth)
      {
        userallowed = false;
        Swal.fire({
          icon: 'error',
          title: 'You were trying to reach an invalid path',
        })
        this.router.navigate(['/']);
      }

      if (!isAuth) {
        userallowed = false;
        this.router.navigate(['/login']);
      }
      const status = userallowed;
      return status;      
    }
  }
  