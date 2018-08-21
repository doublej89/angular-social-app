import { Component, OnInit } from "@angular/core";
import { NgModel } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onSignup(signupForm: NgModel) {
    if (signupForm.invalid) return;
    this.authService.createUser(
      signupForm.value.email,
      signupForm.value.password
    );
  }
}
