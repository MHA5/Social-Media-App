import { Component, OnInit, OnDestroy, Directive, Input, } from '@angular/core'; 
import { PostsService} from '../posts.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/login_signup.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit,OnDestroy {

  posts : string[] = [];
  postsobj: any;
  private postsSub : Subscription;
  userIsAuthenticated = false;
  posthasComment = false;
  private authStatusSub: Subscription;
  userId: string;
  recemail : string;
  // form: FormGroup;
  imagePreview: string;
  public postType: string;
  public postValueMedia: any;
  userRole: string;
  changeTextlike: boolean;
  changeTextdislike: boolean;
  currentuser: string;
  changelikecolor: boolean;
  userViewList: boolean;


  constructor( public postsService: PostsService,
               private authService: AuthService, 
               private route: Router,
               private sanitizer: DomSanitizer,
               ) {}

  ngOnInit() {

    this.postType = null;

    this.recemail = localStorage.getItem("rec_email");

    this.userId = localStorage.getItem("userid");

    this.userRole = localStorage.getItem("role");

    this.currentuser = localStorage.getItem("fname") + " " + localStorage.getItem("lname");

    this.changelikecolor = false;

    this.postsService.getPosts();

    // this.form = new FormGroup({
    //   'comment': new FormControl(null, {
    //     validators: [
    //       Validators.required,
    //       Validators.minLength(2),
    //       Validators.maxLength(250)
    //       ]}),
    // })
     
    

// we are listening to data emitted from service and assigning to Subscription variable so that
// we can end subscription at some time when component destroys to prevent memory leaks
    this.postsSub = this.postsService.getPostUpdateListener().subscribe(
      (postData: { posts:any }) => {
        this.posts = postData.posts.reverse();
        // console.log(this.posts);

        this.postsobj = postData.posts;
        // console.log(this.postsobj);
        // console.log("Posts obj " , this.postsobj[0].comments[0]._id)
        // console.log(this.posts);
      //   for(let i=0; i<this.posts.length; i++){
      //     console.log("Post" + i + " Likes: " + this.posts[i].likes + " DisLikes: " + this.posts[i].dislikes);
      //     this.counter.likesCount = this.posts[i].likes;
      //     this.counter.dislikesCount = this.posts[i].dislikes;
      // }
        
    });

    this.userIsAuthenticated = this.authService.getIsAuth();
    
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
      
  }

  
  onDelete( postId: string) {
        
    Swal.fire({
      title: 'Do you want to delete this post?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.postsService.deletePost(postId).subscribe(() => {
          this.postsService.getPosts();
        });
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      }
    else if (result.dismiss === Swal.DismissReason.cancel) {
        // return
        Swal.fire(
          'Cancelled',
          'Deletion Canceled',
          'error'
        )
      }
    })
    
  }

  likePost(postid) {

    if(this.userIsAuthenticated && this.userRole === 'user') {
    this.postsService.likePost(postid, this.userId)
      .subscribe((resp:any) => {
      // this.counter.likesCount = resp.postlikes;
      // this.likesCount = resp.postlikes;
      // console.log(resp.postlikes);
      this.postsService.getPosts();
    });
    }
    else if(this.userIsAuthenticated && this.userRole === 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Admin can not like any post',
      })
      return;
    }
    else if(this.userIsAuthenticated && this.userRole === 'editor') {
      Swal.fire({
        icon: 'error',
        title: 'Editor can not like any post',
      })
      return;
    }
    else if(this.userIsAuthenticated && this.userRole === 'manager') {
      Swal.fire({
        icon: 'error',
        title: 'Manager can not like any post',
      })
      return;
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'You must sign in to like this post',
      })
      return;
    }

  }

  dislikePost(postid) {
    if(this.userIsAuthenticated && this.userRole === 'user' ) {
    this.postsService.dislikePost(postid, this.userId)
      .subscribe((resp:any) => {
      // this.counter.dislikesCount = resp.postdislikes;
      // this.likesCount = resp.postlikes;
      // console.log(resp.postlikes);
      this.postsService.getPosts();
    });
    }
    else if(this.userIsAuthenticated && this.userRole === 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Admin can not dislike any post',
      })
      return;
    }
    else if(this.userIsAuthenticated && this.userRole === 'editor') {
      Swal.fire({
        icon: 'error',
        title: 'Editor can not dis-like any post',
      })
      return;
    }
    else if(this.userIsAuthenticated && this.userRole === 'manager') {
      Swal.fire({
        icon: 'error',
        title: 'Manager can not dis-like any post',
      })
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'You must sign in to dislike this post',
      })
      return;
    }
  }

  onAddComment(postid, content) {
    if(content.value.length==0 || content.value.length<2 || content.value.length>250) {
      // const errid = "commenterr" + erid;
      // document.getElementById(errid).innerHTML="Comment Length must be between 2 and 250"
      // return; 
      Swal.fire({
        icon: 'error',
        title: 'Comment Length is invalid',
        text: 'Enter Comment between 2 and 250 characters',
      })
      return;
    }
    else {
      const userid = localStorage.getItem("userid");
      const comment = content.value;
      const post_id = postid;
      this.postsService.postComment(post_id, userid, comment).subscribe((resp:any) => {
        this.postsService.getPosts(); // Refresh all posts to reflect the new comment
        // if (JSON.stringify(this.postsobj[0].comment) !== "" ) {
        //   alert(this.postsobj.comments);
        //   this.posthasComment = true;
        // }
      });
    }
  }

  onImagePicked(event, postid) {

      const refElement = event.target;
      const uploadedFile = refElement.files[0];

      if(uploadedFile.type === 'image/jpeg' || uploadedFile.type === 'image/png' || uploadedFile.type === 'image/jpg') {
        
      const uploadedFileAsUrl = URL.createObjectURL(uploadedFile);
      const uploadedFileAsUrlNew = this.sanitizer.bypassSecurityTrustResourceUrl(uploadedFileAsUrl);

      this.postType = 'IMAGE';
      this.postValueMedia = uploadedFileAsUrlNew;

      const userid = localStorage.getItem("userid");
      const imageobject = uploadedFile;
      const post_id = postid;
      this.postsService.postImageComment(post_id, userid, imageobject)
      .subscribe((resp:any) => {
        this.postsService.getPosts();
        this.postType = null;
      });

      }
      else {
        // alert("File is not image");
        Swal.fire({
          icon: 'error',
          title: 'You did not select image...',
          text: 'Please select an image file!',
          // footer: '<a href>Why do I have this issue?</a>'
        })
        return;
      }

      

  }

  postReply(postid, commentid, reply, commenttype) {

    if(reply.value.length==0 || reply.value.length<2 || reply.value.length>250) {
      Swal.fire({
        icon: 'error',
        title: 'Reply Length is invalid',
        text: 'Enter Reply between 2 and 250 characters',
      })
      return;
    }
    else {
          if(this.isValidURL(commenttype)) {
              const replyType = "pic";
              const userid = localStorage.getItem("userid");
              const _reply = reply.value;
              const comment_id = commentid;
              const post_id = postid;
              this.postsService.postReply(userid, post_id, comment_id, _reply, replyType)              
          }
          else {
              const replyType = "text";
              const userid = localStorage.getItem("userid");
              const _reply = reply.value;
              const comment_id = commentid;
              const post_id = postid;
              this.postsService.postReply(userid, post_id, comment_id, _reply, replyType)              
          }
      
    }
  }

  isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)/g);
  return (res !== null)
  };

  openPost(postid){
    if(this.userIsAuthenticated && !(this.userRole === 'admin' || this.userRole === 'editor' || this.userRole === 'manager')) {
    const userid = localStorage.getItem("userid");
    this.postsService.addPostView(postid, userid).subscribe((response)=>{
      // Swal.fire({
      //   icon: 'info',
      //   title: 'Post View Operation Completed',
      // })
      this.postsService.getPosts();
      return;
    });
    // this.route.navigate(['openPost'+'/'+postid]);
    }
    else {
      return;
    }
  }  

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }



  // posts is array
  // posts = [

  //   // this is js object, that means array can contain ain object "array of objects"
  //   {content: 'This is the first post\'s content'},
  //   {content: 'This is the second post\'s content'},
  //   {content: 'This is the third post\'s content'},
  // ]

  


}
