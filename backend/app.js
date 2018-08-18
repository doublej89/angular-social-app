const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", (req, res, next) => {
  const posts = [
    { id: "hf3894fh83fhufw723", title: "Post 1", content: "First server post" },
    { id: "589gr38u88t29t", title: "Post 2", content: "Second server post" }
  ];
  res.status(200).json({ message: "Posts fetched!", posts: posts });
});

app.post("/api/posts", (req, res, next) => {
  const post = req.body;
  res.status(201).json();
});

module.exports = app;
