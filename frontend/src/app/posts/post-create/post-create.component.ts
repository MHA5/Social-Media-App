
import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService, Post } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  enteredContent = '';
  post: Post;
  private mode = 'create';
  private postId: string;
  form: FormGroup;
  imagePreview: string;
  imagenotselected = false;
  contentinvalid = false;
  

  constructor(public postsService: PostsService, public route: ActivatedRoute ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'content': new FormControl(null, ),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
    })
    // paramMap is built-in observable to which we subscribe, we do not need to unsub because 
    // it is built-in
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postsService.getPost(this.postId)
          .subscribe(postData => {
            if(postData.content === 'null') {
              // var cont = '';
              this.post = {
                id: postData._id,
                content: '',
                imagePath: postData.imagePath,
                creator: postData.creator,
                };
            }            
            else {
              this.post = {
                id: postData._id,
                content: postData.content,
                imagePath: postData.imagePath,
                creator: postData.creator,
                };
            }
            this.form.setValue({ 
              'content': this.post.content,
              'image': this.post.imagePath,
               })
               this.imagePreview = this.post.imagePath;              
               document.getElementById("edittitle").innerHTML = "You are here to edit post";
            // document.getElementById("imagename").innerHTML = this.post.imagePath;
          });
      }
      else {
        this.mode = 'create';
        this.postId = 'null';
        document.getElementById("createtitle").innerHTML = "You are here to create new post";
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);

  }

  onSavePost() {
    if(this.form.invalid) {
      this.imagenotselected = true;
      Swal.fire(
        'error',
        'Image is required for post',
        'error'
      )
      return; 
    }

    if(this.mode === 'create') {
      const postType = 'post';
      // if(this.form.value.content && this.form.value.image) {
      this.postsService.addPost(this.form.value.content, this.form.value.image, postType);
      // }
      // else if(this.form.value.content && !(this.form.value.image) ) {        
      //   // this.postsService.addPostContent(this.form.value.content);
      // }
      // else if(!(this.form.value.content) && this.form.value.image ) {
      //   // this.postsService.addPostContent(this.form.value.image);
      // }
    }

    else {
      this.postsService.updatePost( this.postId, this.form.value.content, this.form.value.image)
    }
    
    this.form.reset();
    
  }


}

