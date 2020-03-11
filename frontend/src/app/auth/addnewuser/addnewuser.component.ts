import { Component } from '@angular/core';
import { NgForm } from "@angular/forms";
import { AuthService } from "../login_signup.service";
import { Router } from '@angular/router';
import Swal from 'sweetalert2'


@Component({
  selector: 'app-addnewuser',
  templateUrl: './addnewuser.component.html',
  styleUrls: ['./addnewuser.component.css']
})
export class AddnewuserComponent {

  selected = 'editor';

  constructor(public authService: AuthService, private route: Router) {}


  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.authService.createUser(form.value.email, form.value.password, form.value.fname, form.value.lname, this.selected)
    .subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'User Account has been created',
      })
      this.route.navigate(['']);
    },
      err => {
      // document.getElementById("usernotexist").innerHTML="Email is already registered";
      // console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Email is already registered',
      })
      return;
      });
  }

}
