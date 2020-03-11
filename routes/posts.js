
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const multer = require("multer");
const middleware = require("../middleware/mw");


const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

// image path configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid Mime Type");
        if (isValid) {
            error = null;
        }
        cb(error, "images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name);
    }
});

// 
// create post in db
// 
router.post('', middleware, multer({storage: storage}).single("image"), (req, res) => {
    
    // User.findById( req.userData.userId )
    // .then(user => {

    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId,
        postUser:  req.body.postUser,
        postType: req.body.postType,
        // userPic: user.profilepic,
    });

    post.save()
        .then(createdPost => {
            // 201 means ok and new resource created
        res.status(201).json({
        message: 'Post added Successfully',
        post: {
            ...createdPost,
            id: createdPost._id,
            // postUser: createdPost.postUser
        }
        });
    });
    // console.log("Post Created " + post);

  // });
    
})

// VIEW POSTS
router.get('', (req, res) => {

    Post.find()
    // here find method does not return promise, then how then works
    .then(documents => {
        // console.log("View posts " + documents);
        res.status(200).json({
            message: 'Posts fetched succesfully',
            posts: documents
        });
    })

    // if we want to send back response it should be in then block up above, because node/js
    //  executes find() method asynchronously and does not wait for response and will execute 
    // status code method where data has not arrived yet
    // res.status(200).json({
    //     message: 'Posts fetched succesfully',
    //     posts: posts
    // });

});

router.get("/:id", (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(post) {
                res.status(200).json(post);
            }
            else {
                res.status(404).json({message: 'Post not found'});
            }
        })
})

// Update Post API
// put replaces all object with new data while patch can be used to update some not all fields
router.put('/:id', middleware, multer({storage: storage}).single("image"), (req, res) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get('host'); 
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        content: req.body.content,
        imagePath: imagePath,
    });

    console.log(post);
    Post.updateOne( { _id: req.params.id } , post)
        .then(result => {
            if (result.nModified > 0) {
                res.status(200).json({ message: "Update successful!" });
              } else {
                res.status(401).json({ message: "Not authorized!" });
              }
        })
        // .catch((err) => {
        //     console.log("Error Updating Post " + err);
        // })
        
});

router.delete("/:id", middleware, (req, res) => {
    
    // Post.deleteOne(  {_id: req.params.id, creator: req.userData.userId } )
    Post.deleteOne(  {_id: req.params.id } )
        .then(result => {
            ////////////////////////////////////////////
            // result holds full info of deleted object
            ///////////////////////////////////////////
            // console.log("Post deleted id: " + result.id);
            if (result.n > 0) {
                res.status(200).json({ message: "Deletion successful!" });
              } else {
                res.status(401).json({ message: "Not authorized!" });
              }
        })
        // .catch((err) => {
        //     console.log("Error Deleting Post " + err);
        // })
    
});

/* ===============================================================
     CREATE STATUS IN DB
  =============================================================== */

  router.post('/addstatus', middleware, (req, res) => {
    
    // User.findById( req.userData.userId )
    // .then(user => {

    const post = new Post({
        content: req.body.content,
        creator: req.userData.userId,
        postUser:  req.body.postUser,
        postType: req.body.postType,
    });

    post.save()
        .then(createdPost => {
            // 201 means ok and new resource created
        res.status(201).json({
        message: 'Post added Successfully',
        post: {
            ...createdPost,
            id: createdPost._id,
            // postUser: createdPost.postUser
        }
        });
    });
    // console.log("Post Created " + post);

  // });
    
});

/* ===============================================================
     UPDATE STATUS IN DB
  =============================================================== */
  router.put('/updatestatus/:id', middleware, (req, res) => {    
    const post = new Post({
        _id: req.body.id,
        content: req.body.content,
    });

    console.log(post);
    Post.updateOne( { _id: req.params.id } , post)
        .then(result => {
            if (result.nModified > 0) {
                res.status(200).json({ message: "Update successful!" });
              } else {
                res.status(401).json({ message: "Not authorized!" });
              }
        })
        // .catch((err) => {
        //     console.log("Error Updating Post " + err);
        // })
        
});



/* ===============================================================
     LIKE POST
  =============================================================== */
router.post("/likePost",  (req, res) => {

    Post.findById( req.body.postid )
        .then(post => {
            if(post) {
                User.findById( req.body.userid )
                    .then(user => {
                        // if user already liked then undo like
                        if(post.likedBy.includes(user.fname + ' ' + user.lname)) {
                            post.likes--; // Reduce the total number of likes
                            const arrayIndex = post.likedBy.indexOf(user.fname + ' ' + user.lname); // Get the index of the username in the array for removal
                            post.likedBy.splice(arrayIndex, 1); // Remove user from array
                            post.save((err) => {
                                if(err) {
                                    console.log("Like Undo Failed");
                                }
                                else {
                                    // console.log("Post Liked Successfully");
                                    res.status(200).json({ 
                                        message: "Like Undo Success",
                                        postlikes: post.likes
                                     });
                                }
                            });
                        }
                        else 
                        {
                            if (post.dislikedBy.includes(user.fname + ' ' + user.lname)) {
                                post.dislikes--; // Reduce the total number of dislikes
                                const arrayIndex = post.dislikedBy.indexOf(user.fname + ' ' + user.lname); // Get the index of the username in the array for removal
                                post.dislikedBy.splice(arrayIndex, 1); // Remove user from array
                                post.likes++;
                                post.likedBy.push(user.fname + ' ' + user.lname);
                                post.save((err) => {
                                    if(err) {
                                        console.log("Like Failed");
                                    }
                                    else {
                                        // console.log("Post Liked Successfully");
                                        res.status(200).json({ 
                                            message: "Post Liked Successfully",
                                            postlikes: post.likes
                                         });
                                    }
                                })
                                }

                                else {
                                post.likes++;
                                post.likedBy.push(user.fname + ' ' + user.lname);
                                post.save((err) => {
                                    if(err) {
                                        console.log("Like Failed");
                                    }
                                    else {
                                        // console.log("Post Liked Successfully");
                                        res.status(200).json({ 
                                            message: "Post Liked Successfully",
                                            postlikes: post.likes
                                         });
                                    }
                                })
                                }
                            }
                    })
                    .catch(err => {
                        console.log("User not found " + err);
                    })
            }
        })
        .catch(err => {
            console.log("Error in Finding Post " + err);
        })
})

/* ===============================================================
     DIS-LIKE POST
  =============================================================== */
  router.post("/dislikePost",  (req, res) => {

    Post.findById( req.body.postid )
        .then(post => {
            if(post) {
                User.findById( req.body.userid )
                    .then(user => {
                        if(post.dislikedBy.includes(user.fname + ' ' + user.lname)) {
                            post.dislikes--; // Reduce the total number of likes
                            const arrayIndex = post.dislikedBy.indexOf(user.fname + ' ' + user.lname); // Get the index of the username in the array for removal
                            post.dislikedBy.splice(arrayIndex, 1); // Remove user from array
                            post.save((err) => {
                                if(err) {
                                    console.log("Dislike Undo Failed");
                                }
                                else {
                                    // console.log("Post Liked Successfully");
                                    res.status(200).json({ 
                                        message: "Dislike Undo Success",
                                        postdislikes: post.dislikes
                                     });
                                }
                            });
                        }
                        else {
                            if (post.likedBy.includes(user.fname + ' ' + user.lname)) {
                                post.likes--; // Reduce the total number of likes
                                const arrayIndex = post.likedBy.indexOf(user.fname + ' ' + user.lname); // Get the index of the username in the array for removal
                                post.likedBy.splice(arrayIndex, 1); // Remove user from array

                                post.dislikes++;
                                post.dislikedBy.push(user.fname + ' ' + user.lname);
                                post.save((err) => {
                                    if(err) {
                                        console.log("Dis-Like Failed");
                                    }
                                    else {
                                        // console.log("Post Liked Successfully");
                                        res.status(200).json({ 
                                            message: "Post Dis-Liked Successfully",
                                            postdislikes: post.dislikes
                                         });
                                    }
                                })
                                }

                                else {
                                post.dislikes++;
                                post.dislikedBy.push(user.fname + ' ' + user.lname);
                                post.save((err) => {
                                    if(err) {
                                        console.log("Dis-Like Failed");
                                    }
                                    else {
                                        // console.log("Post Liked Successfully");
                                        res.status(200).json({ 
                                            message: "Post Dis-Liked Successfully",
                                            postdislikes: post.dislikes
                                         });
                                    }
                                })
                                }
                            }
                    })
                    .catch(err => {
                        console.log("User not found " + err);
                    })
            }
        })
        .catch(err => {
            console.log("Error in Finding Post " + err);
        })
});

/* ===============================================================
     COMMENT ON POST
  =============================================================== */
  router.post('/comment', (req, res) => {
    // Check if comment was provided in request body
    if (!req.body.comment) {
      res.json({ success: false, message: 'No comment provided' }); // Return error message
    } else {
      // Check if post-id was provided in request body
      if (!req.body.postid) {
        res.json({ success: false, message: 'No Post id was provided' }); // Return error message
      } else {
        // Use id to search for post post in database
        Post.findOne({ _id: req.body.postid }, (err, post) => {
          // Check if error was found
          if (err) {
            res.json({ success: false, message: 'Invalid post id' }); // Return error message
          } else {
            // Check if id matched the id of any post post in the database
            if (!post) {
              res.json({ success: false, message: 'Post not found.' }); // Return error message
            } else {
              // Grab data of user that is logged in
              User.findOne({ _id: req.body.userid }, (err, user) => {
                // Check if error was found
                if (err) {
                  res.json({ success: false, message: 'Something went wrong' }); // Return error message
                } else {
                  // Check if user was found in the database
                  if (!user) {
                    res.json({ success: false, message: 'User not found.' }); // Return error message
                  } else {
                    // Add the new comment to the post post's array
                    post.comments.push({
                      comment: req.body.comment, // Comment field
                      commentator: user.fname + ' '+ user.lname // Person who commented
                    });

                    // console.log('Post after pushing data ' + post);

                    // post.comments.reverse();
                    // Post.markModified('comments');
                    // console.log(post);

                    // Save post post
                    post.save((err) => {
                      // Check if error was found
                      if (err) {
                        console.log('error saving comment');
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                          console.log("Comment saved success!!!");
                          console.log(post);
                        res.json({ success: true, message: 'Comment saved' }); // Return success message
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  });


/* ===============================================================
     IMAGE COMMENT ON POST
  =============================================================== */
  router.post('/imageComment', middleware, multer({storage: storage}).single("image"), (req, res) => {
 
    const url = req.protocol + '://' + req.get('host'); 

      // Check if post-id was provided in request body
      if (!req.body.postid) {
        res.json({ success: false, message: 'No Post id was provided' }); // Return error message
      } else {
        // Use id to search for post post in database
        Post.findOne({ _id: req.body.postid }, (err, post) => {
          // Check if error was found
          if (err) {
            res.json({ success: false, message: 'Invalid post id' }); // Return error message
          } else {
            // Check if id matched the id of any post post in the database
            if (!post) {
              res.json({ success: false, message: 'Post not found.' }); // Return error message
            } else {
              // Grab data of user that is logged in
              User.findOne({ _id: req.body.userid }, (err, user) => {
                // Check if error was found
                if (err) {
                  res.json({ success: false, message: 'Something went wrong' }); // Return error message
                } else {
                  // Check if user was found in the database
                  if (!user) {
                    res.json({ success: false, message: 'User not found.' }); // Return error message
                  } else {
                    // Add the new comment to the post post's array
                    post.piccomments.push({
                      commentpic: url + '/images/' + req.file.filename,
                      commentator: user.fname + ' '+ user.lname // Person who commented
                    });
                    console.log('Post after pushing data ' + post);
                    // Save post post
                    post.save((err) => {
                      // Check if error was found
                      if (err) {
                        console.log('error saving comment');
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                          console.log("Comment saved success!!!");
                        res.json({ success: true, message: 'Comment saved' }); // Return success message
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }

  });
  
/* ===============================================================
     REPLY TO COMMENT ON POST
  =============================================================== */
  router.post('/reply', (req, res) => {
    // Check if reply to comment was provided in request body 
    // console.log(req.body.reply);
    // console.log(req.body.postid);
    // console.log(req.body.commentid);
    // console.log(req.body.userid);
    // console.log(req.body.replyType)
    if (!req.body.reply) {
      console.log("No reply provided");
      res.json({ success: false, message: 'No reply to comment provided' }); // Return error message
    } else {
      // Check if post-id was provided in request body
      if (!req.body.postid) {
        console.log("No postid provided ");
        res.json({ success: false, message: 'No Post id was provided' }); // Return error message
      } else {
        // Use id to search for post post in database
        Post.findOne({ _id: req.body.postid }, (err, post) => {
          // Check if error was found
          if (err) {
            console.log("invalid post id");
            res.json({ success: false, message: 'Invalid post id' }); // Return error message
          } else {
            // Check if id matched the id of any post post in the database
            if (!post) {
                console.log("Post not found");
              res.json({ success: false, message: 'Post not found.' }); // Return error message
            } else {
              // Grab data of user that is logged in
              User.findOne({ _id: req.body.userid }, (err, user) => {
                // Check if error was found
                if (err) {
                    console.log("someting wrong");
                  res.json({ success: false, message: 'Something went wrong' }); // Return error message
                } else {
                  // Check if user was found in the database
                  if (!user) {
                    console.log("user not found");
                    res.json({ success: false, message: 'User not found.' }); // Return error message
                  } else {
                    // Add the new comment to the post post's array
                    // post.comments.push({
                    //   reply: req.body.reply, // Comment field
                    //   replier: user.fname + ' '+ user.lname // Person who replied
                    // });
                    if(req.body.replyType === 'text') {
                    Post.updateOne( { _id: req.body.postid, comments: {$elemMatch: {_id: req.body.commentid}} } , 
                                     {$push: {'comments.$.replies': {
                                            'reply': req.body.reply,
                                            'replier':user.fname + ' ' + user.lname
                                              }
                                            }
                                            }, // list fields you like to change
                                             {'new': true, 'safe': true, 'upsert': true}
                                             )
// Post.updateOne( { _id: req.body.postid, comments: {$elemMatch: {_id: req.body.commentid}} } , 
// {$set: {'comments.$.reply': req.body.reply,
// 'comments.$.replier': user.fname + ' ' + user.lname}}, // list fields you like to change
// {'new': true, 'safe': true, 'upsert': true})                                             
                        .then(result => {
                            res.json({ 
                              message: 'success', 
                              result
                          })
                            console.log(result);
                            })
                            .catch((err) => {
                                console.log("Error Saving Reply " + err);
                            })
                  }
                  
                  else {
                    Post.updateOne( { _id: req.body.postid, piccomments: {$elemMatch: {_id: req.body.commentid}} } , 
                                     {$push: {'piccomments.$.replies': {
                                            'reply': req.body.reply,
                                            'replier':user.fname + ' ' + user.lname
                                              }
                                            }
                                            }, // list fields you like to change
                                             {'new': true, 'safe': true, 'upsert': true}
                                             )
// Post.updateOne( { _id: req.body.postid, comments: {$elemMatch: {_id: req.body.commentid}} } , 
// {$set: {'comments.$.reply': req.body.reply,
// 'comments.$.replier': user.fname + ' ' + user.lname}}, // list fields you like to change
// {'new': true, 'safe': true, 'upsert': true})                                             
                        .then(result => {
                            res.json({ 
                              message: 'success', 
                              result
                          })
                            console.log(result);
                            })
                            .catch((err) => {
                                console.log("Error Saving Reply " + err);
                            })
                  }

                    // Save post post
                    // post.save((err) => {
                    //   // Check if error was found
                    //   if (err) {
                    //     console.log('error saving reply to comment');
                    //     res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                    //   } else {
                    //     console.log("Reply to Comment saved success!!!");
                    //     res.json({ success: true, message: 'Reply to Comment saved' }); // Return success message
                    //   }
                    // });
                  }
                }
              });
            }
          }
        });
      }
    }

  });

/* ===============================================================
     ADD POST VIEW
  =============================================================== */  
  router.post('/postview', function (req, res) {
    if (!req.body.postid) {
      console.log("No postid provided ");
      res.json({ success: false, message: 'No Post id was provided' }); // Return error message
    } else {
    Post.findOne(
      { _id: req.body.postid }, (err, post) => {
        // Check if error was found
        if (err) {
          console.log("invalid post id");
          res.json({ success: false, message: 'Invalid post id' }); // Return error message
        } else {
          if (!post) {
          console.log("Post not found");
          res.json({ success: false, message: 'Post not found.' }); // Return error message
        } else {
              // Grab data of user that is logged in
              User.findOne({ _id: req.body.userid }, (err, user) => {
                // Check if error was found
                if (err) {
                  console.log("User not found");
                  res.json({ success: false, message: 'User not found' }); // Return error message
                } else {
                  // Check if user was found in the database
                  if (!user) {
                    console.log("user not found");
                    res.json({ success: false, message: 'User not found.' }); // Return error message
                  } else {
                    if(post.viewedBy.includes(user.fname + ' ' + user.lname)) {
                      res.status(200).json({ 
                              message: "Post Viewed Already",
                      }); 
                    //   post.views--;
                    //   const arrayIndex = post.viewedBy.indexOf(user.fname + ' ' + user.lname); // Get the index of the username in the array for removal
                    //   post.viewedBy.splice(arrayIndex, 1); // Remove user from array
                    //   post.save((err) => {
                    //     if(err) {
                    //         console.log("Post View Undo Failed");
                    //     }
                    //     else {
                    //         // console.log("Post Liked Successfully");
                    //         res.status(200).json({ 
                    //             message: "Post View Undo Success",
                    //          });
                    //       }
                    //   });
                    }

                    else {
                      post.views++;
                      post.viewedBy.push(user.fname + ' ' + user.lname);
                      post.save((err) => {
                        if(err) {
                            console.log("Post View Failed");
                        }
                        else {
                            // console.log("Post Liked Successfully");
                            res.status(200).json({ 
                                message: "Post Viewed Successfully",
                                postviews: post.views
                             });
                        }
                    })
                    }

                  }
          /////
      }
    })
    }
    }
    }
    )
  }
  });
  


module.exports = router;