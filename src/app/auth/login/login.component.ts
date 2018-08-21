import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }
    this.authService.loginUser(loginForm.value.email, loginForm.value.password);
  }
}
