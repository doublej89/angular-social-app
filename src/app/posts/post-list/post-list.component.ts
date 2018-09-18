import { Component, OnInit, OnDestroy } from "@angular/core";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material";
import { AuthService } from "../../auth/auth.service";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading: boolean = false;
  totalPosts: number = 0;
  postsPerPage: number = 3;
  currentPage: number = 1;
  pageSizeOptions: number[] = [1, 2, 5, 10];
  private authStatusSub: Subscription;
  isAuthenticated: boolean = false;
  userId: string;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postsData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postsData.postCount;
        this.posts = postsData.posts;
      });
    this.isAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(event: PageEvent) {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postsPerPage = event.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  findUserLike(likes) {
    let userLikes = likes.filter(like => like.user === this.userId);
    if (userLikes.length > 0) {
      return true;
    }
    return false;
  }

  onLikeClick(postId: string) {
    this.postsService.addLike(postId).subscribe(data => {
      console.log(data);
      if (data.hasOwnProperty("alreadyliked")) {
        return;
      }
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onUnLikeClick(postId: string) {
    this.postsService.removeLike(postId).subscribe(data => {
      console.log(data);
      if (data.hasOwnProperty("notLiked")) {
        return;
      }
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(postId) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }
}
