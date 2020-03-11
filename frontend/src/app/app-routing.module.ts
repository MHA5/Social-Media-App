import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { StatusCreatComponent } from './posts/status-creat/status-creat.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { EditGuard } from './auth/edit.guard';
import { AddnewuserComponent } from './auth/addnewuser/addnewuser.component';
import { AddNewUserGuard } from './auth/addnewuser.guard';
import { OpenPostComponent } from './open-post/open-post.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { LoginGuard } from './auth/login.guard';


const routes: Routes = [
  { path: '', component: PostListComponent},
  { path: 'addpost', component: PostCreateComponent, canActivate: [AuthGuard]} ,
  { path: 'addstatus', component: StatusCreatComponent, canActivate: [AuthGuard]} ,
  { path: 'editstatus/:postId', component: StatusCreatComponent, canActivate: [EditGuard]},
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [EditGuard]},
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
  { path: 'signup', component: SignupComponent},
  { path: 'addnewuser', component: AddnewuserComponent, canActivate: [AddNewUserGuard]},
  { path: '**', component: PostListComponent}
  // { path: 'openPost/:id', component: OpenPostComponent},
  // { path: 'editprofile/:userId', component: EditprofileComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, EditGuard, AddNewUserGuard, LoginGuard]
})
export class AppRoutingModule { }
