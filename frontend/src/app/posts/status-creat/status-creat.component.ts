import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService, Post } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'app-status-creat',
  templateUrl: './status-creat.component.html',
  styleUrls: ['./status-creat.component.css']
})
export class StatusCreatComponent implements OnInit {

  enteredContent = '';
  post;
  private mode = 'create';
  private postId: string;
  form: FormGroup;

  constructor(public postsService: PostsService, public route: ActivatedRoute ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'content': new FormControl(null, {validators: [Validators.required]}),
    });

    // paramMap is built-in observable to which we subscribe, we do not need to unsub because 
    // it is built-in
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postsService.getPost(this.postId)
          .subscribe(postData => {
            this.post = {
              id: postData._id,
              content: postData.content,
              creator: postData.creator,
              };

            this.form.setValue({ 
              'content': this.post.content,
               })          
               document.getElementById("edittitle").innerHTML = "You are here to edit status";
          });
      }
      else {
        this.mode = 'create';
        this.postId = 'null';
        document.getElementById("createtitle").innerHTML = "You are here to add status";
      }
    });
  }

  onSavePost() {
    if(this.form.invalid) {
      return; 
    }

    if(this.mode === 'create') {
      const postType = 'status';
      this.postsService.addStatus(this.form.value.content, postType);
    }
    else {
      this.postsService.updatePost( this.postId, this.form.value.content, this.form.value.image);
    }
    
    this.form.reset();
    
  }

}
