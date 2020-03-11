import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService  } from '../auth/login_signup.service';
import { NgForm } from "@angular/forms";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})
export class EditprofileComponent implements OnInit {

  private userId: string;

  userData = {
    fname: '',
    lname: '',
    email: '',
    password: '',
  }

  constructor(
              public authService: AuthService, 
              public route: ActivatedRoute,
              public router: Router
              ) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.updateUser(form.value.email, form.value.fname, form.value.lname, form.value.password ,this.userId)
    .subscribe((response:any) => {

      if (response.result.nModified > 0) {
      Swal.fire({
        icon: 'success',
        title: 'Your profile has been updated',
      })
      this.authService.logout();
      this.router.navigate(['/login']);
      }
      else if(response.result.nModified = '0' ) {
        Swal.fire({
          icon: 'info',
          title: 'You did not change any value',
        })
        this.router.navigate(['/editprofile', this.userId]);        
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Error updating profile',
        })
        this.router.navigate(['/editprofile', this.userId]);        
      }
    })
  }    

  ngOnInit() {
    // paramMap is built-in observable to which we subscribe, we do not need to unsub because 
    // it is built-in
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('userId')) {
        this.userId = paramMap.get('userId');
        this.authService.getUserById(this.userId)
          .subscribe((userData:any) => {
            
            this.userData = {
              fname: userData.fname,
              lname: userData.lname,
              email: userData.email,
              password: userData.password
              };            
               
          });
      }
      
    });
  }

}
