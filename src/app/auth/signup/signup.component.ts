import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgModel } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private authStatusSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  onSignup(signupForm: NgModel) {
    if (signupForm.invalid) return;
    this.isLoading = true;
    this.authService.createUser(
      signupForm.value.name,
      signupForm.value.email,
      signupForm.value.password
    );
  }
}
