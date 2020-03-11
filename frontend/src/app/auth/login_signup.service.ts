import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { Subject, Observable } from "rxjs";
import Swal from 'sweetalert2'


export interface AuthData {
    email: string;
    password: string;
    fname: string;
    lname: string;
    role: string;
    image: File;
  } 

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  public resp_email : string;
  public resp_fname : string;
  public resp_lname : string;
  private token: string;
  private tokenTimer: any;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();
  private userId: string;
  private userRole: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }


  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
  // , imageobject: File
  createUser(email: string, password: string, fname: string, lname: string, role: string) : Observable<any> {
    const userData= {email: email, fname: fname, lname: lname, password: password, role: role };
    // const userData = new FormData();
    // userData.append('email', email);
    // userData.append('password', password);
    // userData.append('fname', fname);
    // userData.append('lname', lname);
    // userData.append('role', role);
    // userData.append('image', imageobject);
    // console.log(userData);
    return this.http.post("http://localhost:3000/user/signup", userData);
      
  }

  updateUser(email: string, fname: string, lname: string, password: string, userid: string) : Observable<any> {
    const updateData= {email: email, fname: fname, lname: lname, password: password, userid: userid };
    return this.http.post("http://localhost:3000/user/updateuser", updateData);
      
  }

  getUserById(userid: string) {
    return this.http.get("http://localhost:3000/user/" + userid);
  }

  login(email: string, password: string) {
    const authData = {email: email, password: password};
    this.http.post<{ token: string, userId: string, role: string, fname: string, lname: string, email: string, expiresIn: number }>("http://localhost:3000/user/login", authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
            this.resp_email = response.email;
            this.resp_fname = response.fname;
            this.resp_lname = response.lname;
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userRole = response.role;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
            // console.log(expirationDate);
            this.saveAuthData(token, expirationDate, this.resp_email, this.userId, this.resp_fname, this.resp_lname, this.userRole);
            this.router.navigate(['/']);
          }
      },
      err => {
        // document.getElementById("loginerr").innerHTML="Email or password is incorrect"
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is incorrect',
        })
        return;
      })
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    // console.log("Setting timer: " + duration); 
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, rec_email: string, userId: string, fname: string, lname: string, role: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("rec_email", rec_email);
    localStorage.setItem("userid", userId);
    localStorage.setItem("fname", fname);
    localStorage.setItem("lname", lname);
    localStorage.setItem("role", role);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("rec_email");
    localStorage.removeItem("userid");
    localStorage.removeItem("fname");
    localStorage.removeItem("lname");
    localStorage.removeItem("role");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if (!token || !expirationDate ) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

}


