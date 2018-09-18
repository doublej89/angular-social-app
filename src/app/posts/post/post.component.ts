import { Component, OnInit, OnDestroy } from "@angular/core";
import { PostsService } from "../posts.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Subscription } from "rxjs";
import { NgForm } from "@angular/forms";
import { AuthService } from "../../auth/auth.service";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.css"]
})
export class PostComponent implements OnInit, OnDestroy {
  post: any;
  postId: string;
  sub: Subscription;
  isLoading = false;
  faTimes = faTimes;
  userId: string;
  userName: string;
  userAvatar: string;
  private authStatusSub: Subscription;
  isAuthenticated: boolean = false;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userName = this.authService.getUserName();
    this.userAvatar = this.authService.getUserAvatar();
    this.isAuthenticated = this.authService.getIsAuth();
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoading = true;
      if (params.has("postId")) {
        this.postId = params.get("postId");
        this.sub = this.postsService
          .getPost(this.postId)
          .subscribe((post: any) => {
            this.isLoading = false;
            this.post = post;
          });
      }
    });
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
        this.userName = this.authService.getUserName();
        this.userAvatar = this.authService.getUserAvatar();
      });

    
  }

  onSaveComment(form: NgForm) {
    const commentData = {
      text: form.value.commentText,
      name: this.authService.getUserName(),
      avatar: this.authService.getUserAvatar()
    };
    this.postsService
      .addComment(this.postId, commentData)
      .subscribe((post: any) => {
        this.post = post;
      });
    form.reset();
  }

  onDeleteClick(postId: string, commentId: string) {
    this.postsService.deleteComment(postId, commentId).subscribe(post => {
      this.post = post;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
