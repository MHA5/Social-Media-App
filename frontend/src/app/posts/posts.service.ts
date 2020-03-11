
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


export interface Post {
  id: string;
  content: string;
  imagePath: string;
  creator: string;
}

@Injectable({
  providedIn: 'root'
})

export class PostsService {

  constructor(private http: HttpClient, private router: Router) {};

  private posts : Post [] = [];

  // Subject works same like eventemitter
  private postsUpdated = new Subject< { posts: Post[] } >();

  getPosts() {
    
// spread operator is not working here since i moved Post interface into service, so it is real 
// array and interface of service will have direct impact
    // return this.posts;

// here beacuse we are using observables so we do not need to unsubscribe
    this.http.get<{message: string, posts: any}>('http://localhost:3000/posts')

    // ise remove karna parhe ga shaed sequelize id khud nahi lgata
      .pipe(
        map((postData) => {
        return {
          posts: postData.posts.map(post => {
            // console.log(post);
          return {
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator,
            likes: post.likes,
            likedBy: post.likedBy,
            dislikes: post.dislikes,
            dislikedBy: post.dislikedBy,
            comments: post.comments,
            postUser: post.postUser,
            createdAt: post.createdAt,
            piccomments: post.piccomments,
            views: post.views,
            viewedBy: post.viewedBy,
            postType: post.postType,
          };
        })
      }
      })
      )
      // ise remove karna parhe ga shaed sequelize id khud nahi lgata
      // shaed ye subscribe use ho pipe remove kar ke
      // .subscribe((postData) => {
      //   this.posts = postData.posts;

      .subscribe((transformedPosts) => {
        this.posts = transformedPosts.posts;

// spread operator is working here since i moved Post interface into service, so it is copied 
// array and interface of service will not have direct impact        
        this.postsUpdated.next({
          posts: [...this.posts]
        })
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
// copy object by pulling out the properties of object and make a new object
// return {...this.posts.find(p => p.id === id)}; is se edit wala page refresh karte to data urh jata

    return this.http.get<{
      _id: string,
       content: string,
       imagePath: string,
       creator: string
      }>("http://localhost:3000/posts/" + id);
    
  }

  addPost(content: string, image: File, postType: string) {
    const postData = new FormData();
    postData.append('content', content);
    postData.append('image', image);
    const fname = localStorage.getItem("fname");
    const lname = localStorage.getItem("lname");
    const postUser = fname + " " + lname;
    postData.append('postUser', postUser);
    postData.append('postType', postType);
    // console.log(postData);    
    this.http.post<{ message: string, post: Post }>('http://localhost:3000/posts', postData)
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      })
   
  }

  addStatus(content: string, postType: string) {
    const postData = {
    content: content,
    fname: localStorage.getItem("fname"),
    lname: localStorage.getItem("lname"),
    postUser : localStorage.getItem("fname") + " " + localStorage.getItem("lname"),
    postType: postType,
    }
    // postData.forEach((value,key) => {
    //   console.log(key+" "+value);
    // });   
    
    this.http.post<{ message: string, post: Post }>('http://localhost:3000/posts/addstatus', postData)
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      })
   
  }

  addPostImage(image: File) {
    const postData = new FormData();
    postData.append('image', image);
    const fname = localStorage.getItem("fname");
    const lname = localStorage.getItem("lname");
    const postUser = fname + " " + lname;
    postData.append('postUser', postUser);
    postData.forEach((value,key) => {
      console.log(key+" "+value)
    });    
    // this.http.post<{ message: string, post: Post }>('http://localhost:3000/posts', postData)
    //   .subscribe(responseData => {
    //     this.router.navigate(["/"]);
      // })
   
  }

  // 
  // Update Post
  // 
  updatePost(id: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if(typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('content', content);
      postData.append('image', image);
    }
    else {
      postData = {
        id: id,
        content: content,
        imagePath: image,
        creator: null
      }
    }
    this.http.put("http://localhost:3000/posts/" + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      })
  }

  // 
  // Update Status
  // 

  updateStatus(id: string, content: string) {
      const postData = {
        id: id,
        content: content,
      }    
    this.http.put("http://localhost:3000/posts/updatestatus/" + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      })
  }

  deletePost(postId: string) {
    return this.http.delete("http://localhost:3000/posts/" + postId);
  }

  likePost(postid, userid) {
    const postdata = { 
      postid: postid,
      userid: userid,
    };
    return this.http.post("http://localhost:3000/posts/likePost", postdata);
  }

  dislikePost(postid, userid) {
    const postdata = { 
      postid: postid,
      userid: userid,
    };
    return this.http.post("http://localhost:3000/posts/dislikePost", postdata);
  }

    // Function to post a comment on a blog post
    postComment(postid, userid, comment) {
      const commentData = {
        postid: postid,
        userid: userid,
        comment: comment
      }
      return this.http.post("http://localhost:3000/posts/comment", commentData);
    }

    postImageComment(postid, userid, imageobject) {

      // const commentData = {
      //   postid: postid,
      //   userid: userid,
      //   image: imageobject.name,
      // }
      // console.log(imageobject.name);
      const postData = new FormData();
      postData.append('postid', postid);
      postData.append('userid', userid);
      postData.append('image', imageobject);
      return this.http.post("http://localhost:3000/posts/imageComment", postData);
    }

    postReply(userid, postid, commentid, reply, replyType) {
      const replyData = {
        userid: userid,
        postid: postid,
        commentid: commentid,
        reply: reply,
        replyType: replyType,
      }
      ///////////////////////////////////////////////////////////////////
      // yahan return nahi lgaya tha toh api hi call nahi ho rahi thi wasted 3 hours
      this.http.post("http://localhost:3000/posts/reply", replyData)
      .subscribe(responseData => {
        this.getPosts();
      });
    }

    addPostView(postid, userid){
      const postViewData = {
        postid: postid,
        userid: userid
      }
      return this.http.post("http://localhost:3000/posts/postview", postViewData);
    }
  
}
