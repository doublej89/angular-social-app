const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Post = require("./models/post");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg"
};

const jwt = require("jsonwebtoken");
const checkToken = require("./middleware/check-token");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mimetype!");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

const app = express();

mongoose
  .connect("mongodb://goldenone:test123@ds137661.mlab.com:37661/gqlbooks")
  .then(() => {
    console.log("Connected to database, yea!");
  })
  .catch(() => {
    console.log("Something evil happened!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.get("/api/posts", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let fetchedPosts;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched!",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

app.post(
  "/api/posts",
  checkToken,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
    });
    post.save().then(result => {
      res.status(201).json({
        message: "Post succeeded!",
        post: {
          id: result._id,
          title: result.title,
          content: result.content,
          imagePath: result.imagePath
        }
      });
    });
  }
);

app.put(
  "/api/posts/:id",
  checkToken,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    Post.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      post
    ).then(result => {
      if (result.nModified > 0) {
        res
          .status(200)
          .json({ message: "Update succeeded!", imagePath: result.imagePath });
      } else {
        res
          .status(401)
          .json({ message: "Not Authorized!", imagePath: result.imagePath });
      }
    });
  }
);

app.get("/api/posts/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

app.delete("/api/posts/:id", checkToken, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(
    result => {
      if (result.n > 0) {
        res.status(200).json({ message: "Post deleted!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    }
  );
});

app.post("/api/user/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then(result => {
        res.status(201).json({ message: "User created!", result: result });
      })
      .catch(err => {
        res.status(500).json({ error: err });
      });
  });
});

app.post("/api/user/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: "User doesn't exist" });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({ message: "Password doesn't match" });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "super_secret_private_key",
        { expiresIn: "1hr" }
      );
      res
        .status(200)
        .json({ token: token, expiresIn: 3600, userId: fetchedUser._id });
    })
    .catch(err => {
      return res.status(401).json({ message: "Password doesn't match" });
    });
});

module.exports = app;
