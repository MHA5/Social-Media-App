
const mongoose = require('mongoose');

// Validate Function to check comment length
let commentLengthChecker = (comment) => {
    // Check if comment exists
    if (!comment[0]) {
      return false; // Return error
    } else {
      // Check comment length
      if (comment[0].length < 2 || comment[0].length > 250) {
        return false; // Return error if comment length requirement is not met
      } else {
        return true; // Return comment as valid
      }
    }
  };
  
  // Array of Comment validators
  const commentValidators = [
    // First comment validator
    {
      validator: commentLengthChecker,
      message: 'Comments should not exceed 250 characters.'
    }
  ];
  

// we are not making id prpperty here because id is auto created by mongo
const postSchema = mongoose.Schema({
    // in nodejs String, in angular/normal js code string
    postType: { type: String, required: true },
    content: { type: String  },
    imagePath: {type: String },
    // userPic: { type: String, required: true },
    // creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creator: { type: String, required: true },
    postUser: { type: String, required: true},
    likes: { type: Number, default: 0 },
    likedBy: { type: Array },
    dislikes: { type: Number, default: 0 },
    dislikedBy: { type: Array },
    views: { type: Number, default: 0 },
    viewedBy: { type: Array },
    comments: [{
        comment: { type: String},
        commentator: { type: String },
        replies:[{
        reply: { type: String},
        replier: { type: String}
        }]
      }],
    piccomments: [{
      commentator: { type: String },
      commentpic: { type: String },
      replies:[{
        reply: { type: String},
        replier: { type: String}
        }]
    }],
    
    }
,
    {
  timestamps: true
    }
);

module.exports = mongoose.model('Post', postSchema);