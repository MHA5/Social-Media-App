import { Component, OnInit, OnDestroy, OnChanges, DoCheck } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/login_signup.service";
import { Router } from '@angular/router';



@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})


export class HeaderComponent implements OnInit, OnDestroy, DoCheck {
  
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  username = {
    fname: '',
    lname: ''
  };
  userRole: string;
  userId: string;


  constructor(private authService: AuthService, private route: Router) {}

  ngOnInit() {
    this.getUserName();
    this.getUserRole();
    this.getUserId();    
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;        
      });
  }

  // the username in header was not working properly, yani ke login hone ke baad jo user last login tha
  // us ka naam show ho raha tha, jab ke manual refresh karne ka baad logged in user ata tha
  // is masle ke hal ke liye bohat khapa page ke routes navigate kiye, post-list se header ke variables
  // access kiye magar 
  // solution tha ngDoCheck() 
  // Detect and act upon changes that Angular can't or won't detect on its own.
  // Called during every change detection run, immediately after ngOnChanges() and ngOnInit().
  
  ngDoCheck() {
    this.getUserName();
    this.getUserRole();
    this.getUserId();
  }

  getUserName() {
    this.username.fname = localStorage.getItem('fname');
    this.username.lname = localStorage.getItem('lname');
  }

  getUserRole() {
    this.userRole = localStorage.getItem("role");
    // alert(this.userRole);
  }

  getUserId() {
    this.userId = localStorage.getItem("userid");
  }

  onLogout() {
    this.authService.logout();
  //   this.route.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
  //     this.route.navigate(['/']);
  // }); 
    // this.ngOnInit();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
