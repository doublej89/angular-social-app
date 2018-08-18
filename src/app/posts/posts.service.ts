import { Post } from "./post.model";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private httpClient: HttpClient) {}

  getPosts() {
    this.httpClient
      .get<{ message: string; posts: any }>("http://localhost:3000/api/posts")
      .pipe(
        map(postsData => {
          return postsData.posts.map(post => {
            return { id: post._id, title: post.title, content: post.content };
          });
        })
      )
      .subscribe(transPosts => {
        this.posts = transPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.httpClient
      .post<{ message: string; postId: string }>(
        "http://localhost:3000/api/posts",
        post
      )
      .subscribe(resData => {
        post.id = resData.postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId) {
    this.httpClient
      .delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id != postId);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
