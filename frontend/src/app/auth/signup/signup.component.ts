import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { AuthService } from "../login_signup.service";
import { Router } from '@angular/router';
import Swal from 'sweetalert2'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../../posts/post-create/mime-type.validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit{

  role = 'user';
  // form: FormGroup;
  // imagePreview: string;

  constructor(public authService: AuthService, private route: Router) {}

  ngOnInit() {

    // this.form = new FormGroup({      
    //   'image': new FormControl(null, {
    //     validators: [Validators.required],
    //     asyncValidators: [mimeType]
    //   }),
    // })
}

  // onImagePicked(event: Event) {
  //   const file = (event.target as HTMLInputElement).files[0];
  //   this.form.patchValue({image: file});
  //   this.form.get('image').updateValueAndValidity();
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.imagePreview = reader.result as string;
  //   };
  //   reader.readAsDataURL(file);

  // }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
                                                    // this.form.value.image
    this.authService.createUser(form.value.email, form.value.password, form.value.fname, form.value.lname, this.role)
    .subscribe((response:any) => {
      Swal.fire({
        icon: 'success',
        title: 'Your account has been created',
      })
      // this.route.navigate(['/login']);
        if(response) {
          this.authService.login(response.result.email, response.result.password);
        }
    }
    ,
      err => {
      // document.getElementById("usernotexist").innerHTML="Email is already registered";
      // console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Email is already registered',
      })
      return;
      }
      );
  }

}
