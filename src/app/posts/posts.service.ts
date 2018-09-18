import { Post } from "./post.model";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { AuthService } from "../auth/auth.service";

const BACKEND_URL = "/api/posts";

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private httpClient: HttpClient, private router: Router) {}

  getPosts(pagesize: number, page: number) {
    const queryParams = `?pagesize=${pagesize}&page=${page}`;
    this.httpClient
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(postsData => {
          return {
            posts: postsData.posts.map(post => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
                name: post.name,
                avatar: post.avatar,
                likes: post.likes ? post.likes : [],
                comments: post.comments ? post.comments : []
              };
            }),
            maxPosts: postsData.maxPosts
          };
        })
      )
      .subscribe(transPosts => {
        this.posts = transPosts.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transPosts.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(
    title: string,
    content: string,
    image: File,
    name: string,
    avatar: string
  ) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    postData.append("name", name);
    postData.append("avatar", avatar);
    this.httpClient
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe(resData => {
        this.router.navigate(["/"]);
      });
  }

  addComment(
    id: string,
    comment: {
      text: string;
      name: string;
      avatar: string;
    }
  ) {
    return this.httpClient.post(`${BACKEND_URL}/comment/${id}`, comment);
  }

  deleteComment(postId: string, commentId: string) {
    return this.httpClient.delete(
      `${BACKEND_URL}/comment/${postId}/${commentId}`
    );
  }

  addLike(postId: string) {
    return this.httpClient.post(`${BACKEND_URL}/like/${postId}`, null);
  }

  removeLike(postId: string) {
    return this.httpClient.post(`${BACKEND_URL}/unlike/${postId}`, null);
  }

  getPost(id: string) {
    return this.httpClient.get(BACKEND_URL + "/" + id);
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string,
    name: string,
    avatar: string
  ) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
      postData.append("name", name);
      postData.append("avatar", avatar);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
        name: name,
        avatar: avatar
      };
    }
    this.httpClient
      .put<{ message: string; imagePath: string }>(
        BACKEND_URL + "/" + id,
        postData
      )
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this.httpClient.delete(BACKEND_URL + "/" + postId);
  }
}
