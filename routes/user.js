
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();
const multer = require("multer");

const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

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
      cb(null, name);
  }
});

router.post("/signup", (req, res, next) => {
  // bcrypt.hash(req.body.password, 10).then(hash => {
    // const url = req.protocol + '://' + req.get('host');
    // const imagepath = url + '/images/' + req.file.filename;
    // console.log(imagepath);
    let encryptedPassword = cryptr.encrypt(req.body.password);
    const user = new User({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      password: encryptedPassword,
      role: req.body.role,
      // profilepic: url + '/images/' + req.file.filename,
    });
    // console.log(user);
    user
      .save()
      .then(result => {
        const decryptedpassword = cryptr.decrypt(result.password);
        const user = {
          email: result.email,
          password: decryptedpassword
        }
        res.status(201).json({
          message: "User created!",
          result: user
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });


router.post("/login", (req, res, next) => {
  let fetchedUser;
  let decryptedpassword;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      decryptedpassword = cryptr.decrypt(user.password);
      fetchedUser = user;
      if(decryptedpassword === req.body.password) {
        return true;  
      }
      else {
        return false
      }
      // return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret_this_should_be_longer",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        role: fetchedUser.role,
        userId: fetchedUser._id,
        email: fetchedUser.email,
        fname: fetchedUser.fname,
        lname: fetchedUser.lname,
        expiresIn: 3600,
        // profilepic: fetchedUser.profilepic
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(401).json({
        message: "Auth failed"
      });
    });
});

router.get("/:userid", (req, res) => {
  User.findById(req.params.userid)
      .then(result => {
          if(result) {
            const decryptedpassword = cryptr.decrypt(result.password);
            const user = {
              _id: result._id,
              fname: result.fname,
              lname: result.lname,
              email: result.email,
              password: decryptedpassword,
            }
            res.status(200).json(user);
          }
          else {
              res.status(404).json({message: 'User not found'});
          }
      })
});

router.post("/updateuser", (req,res) => {
  const encryptedpassword = cryptr.encrypt(req.body.password);
  const user = new User({
    _id: req.body.userid,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: encryptedpassword
  });

  User.updateOne( { _id: req.body.userid } , user)
        .then(result => {
          // console.log(result);
            if (result.nModified > 0) {
                res.status(200).json({ message: "Profile Update successful!", result: result });
              } else {
                res.status(200).json({ message: "Same Values", result: result });
              }
        })
})

module.exports = router;
