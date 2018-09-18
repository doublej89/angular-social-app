const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Post = require("./models/post");
const User = require("./models/user");
const Profile = require("./models/profile");
const bcrypt = require("bcrypt");
const multer = require("multer");
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg"
};
const gravatar = require("gravatar");

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
  .connect(process.env.MONGO_CONNECTION_STRING)
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
    })
    .catch(err => {
      res.status(500).json({
        message: "Couldn't fetch posts! Possibly a technical malfunction"
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
      creator: req.userData.userId,
      name: req.body.name,
      avatar: req.body.avatar,
      date: Date.now()
    });
    post
      .save()
      .then(result => {
        res.status(201).json({
          message: "Post succeeded!",
          post: {
            id: result._id,
            title: result.title,
            content: result.content,
            imagePath: result.imagePath,
            creator: result.creator,
            name: result.name,
            date: result.date
          }
        });
      })
      .catch(err => {
        res.status(500).json({ message: "Unable to create post!" });
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
    Post.findOneAndUpdate(
      { _id: req.params.id, creator: req.userData.userId },
      {
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId,
        avatar: req.body.avatar,
        name: req.body.name
      }
    )
      .then(result => {
        console.log(result);
        res.status(200).json({ message: "Update succeeded!", result: result });
      })
      .catch(err => {
        res
          .status(500)
          .json({ message: "Possible a technical malfunction error!" });
      });
  }
);

app.get("/api/posts/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "Couldn't fetch the post! Possibly a technical malfunction"
      });
    });
});

app.delete("/api/posts/:id", checkToken, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: "Post deleted!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "Couldn't delete the post! Possibly a technical malfunction"
      });
    });
});

app.post("/api/posts/like/:id", checkToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      let userLike = post.likes.filter(
        like => like.creator.toString() === req.userData.userId
      );
      if (userLike.length > 0) {
        return res.status(200).json({ alreadyliked: true });
      }
      post.likes.unshift({ creator: req.userData.userId });
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ message: "Post not found!" }));
});

app.post("/api/posts/unlike/:id", checkToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      let userLike = post.likes.filter(
        like => like.creator.toString() === req.userData.userId
      );
      if (userLike.length === 0) {
        return res.status(200).json({ notLiked: true });
      }
      const removeIndex = post.likes
        .map(like => like.creator.toString())
        .indexOf(req.userData.userId);
      post.likes.splice(removeIndex, 1);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ message: "Post not found!" }));
});

app.post("/api/posts/comment/:id", checkToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        creator: req.userData.userId
      };
      post.comments.unshift(newComment);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ message: "Post not found!" }));
});

app.delete(
  "/api/posts/comment/:id/:comment_id",
  checkToken,
  (req, res, next) => {
    Post.findById(req.params.id)
      .then(post => {
        let commentPresent = post.comments.filter(
          comm => comm._id.toString() === req.params.comment_id
        );
        if (commentPresent.length === 0) {
          return res.status(404).json({ message: "No such comment found!" });
        }
        const removeIndex = post.comments
          .map(comm => comm._id.toString())
          .indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ message: "Post not found!" }));
  }
);

app.post("/api/user/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const avatar = gravatar.url(req.body.email, {
      s: "200",
      r: "pg",
      d: "mm"
    });
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      avatar: avatar
    });
    user
      .save()
      .then(result => {
        console.log(result);
        const token = jwt.sign(
          { email: result.email, userId: result._id },
          process.env.JWT_KEY,
          { expiresIn: "1hr" }
        );
        res.status(201).json({
          token: token,
          expiresIn: 3600,
          userId: result._id,
          userName: result.name,
          userAvatar: result.avatar
        });
      })
      .catch(err => {
        console.log(err);
        res
          .status(500)
          .json({ message: "A user with this email address already exists!" });
      });
  });
});

app.post("/api/user/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "No user with this email address exists" });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({ message: "Password doesn't match" });
      }
      const token = jwt.sign(
        {
          email: fetchedUser.email,
          userId: fetchedUser._id
        },
        process.env.JWT_KEY,
        { expiresIn: "1hr" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        userName: fetchedUser.name,
        userAvatar: fetchedUser.avatar
      });
    })
    .catch(err => {
      return res
        .status(401)
        .json({ message: "Invalid authentication credentials!" });
    });
});

app.get("/api/profile", checkToken, (req, res) => {
  Profile.findOne({ user: req.userData.userId })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        console.log("User profile doesn't exist!");
        return res.json({});
      }
      console.log(profile);
      res.json(profile);
    })
    .catch(err => res.status(404).json({ message: err.toString() }));
});

app.get("/api/profile/all", (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        res.status(200).json({});
      } else {
        res.json(profiles);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(404).json({ message: "Fetching profiles failed!" });
    });
});

app.get("/api/profile/handle/:handle", (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        res.status(404).json({ message: "This user has no profile!" });
      } else {
        res.json(profile);
      }
    })
    .catch(err => res.status(404).json({ message: err.toString() }));
});

app.get("/api/profile/user/:user_id", (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        res.status(200).json({ message: "This user has no profile!" });
      } else {
        res.json(profile);
      }
    })
    .catch(err =>
      res
        .status(404)
        .json({ message: "Profile for this user can't be fetched!" })
    );
});

app.post("/api/profile", checkToken, (req, res) => {
  const profileFields = {};
  profileFields.user = req.userData.userId;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.gender) profileFields.gender = req.body.gender;
  Profile.findOne({ user: req.userData.userId }).then(profile => {
    if (profile) {
      Profile.findOneAndUpdate(
        { user: req.userData.userId },
        { $set: profileFields },
        { new: true }
      ).then(profile => res.json(profile));
    } else {
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          return res
            .status(400)
            .json({ message: "That handle already exists!" });
        }
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

app.post("/api/profile/experience", checkToken, (req, res) => {
  Profile.findOne({ user: req.userData.userId }).then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.experience.unshift(newExp);
    profile
      .save()
      .then(profile => res.json(profile))
      .catch(err =>
        res.status(404).json({ message: "experiecne couldn't be saved!" })
      );
  });
});

app.delete("/api/profile/experience/:exp_id", checkToken, (req, res) => {
  Profile.findOne({ user: req.userData.userId })
    .then(profile => {
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);
      profile.experience.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json({ message: err.toString() }));
});

app.post("/api/profile/education", checkToken, (req, res) => {
  Profile.findOne({ user: req.userData.userId }).then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.education.unshift(newEdu);
    profile.save().then(profile => res.json(profile));
  });
});

app.delete("/api/profile/education/:edu_id", checkToken, (req, res) => {
  Profile.findOne({ user: req.userData.userId })
    .then(profile => {
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
      profile.education.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json({ message: err.toString() }));
});

app.delete("/api/profile", checkToken, (req, res) => {
  Profile.findOneAndRemove({ user: req.userData.userId }).then(() => {
    User.findOneAndRemove({ _id: req.userData.userId }).then(() =>
      res.json({ success: true })
    );
  });
});

module.exports = app;
