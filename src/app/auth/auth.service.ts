import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data.model";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";

const BACKEND_URL = "/api/user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private userName: string;
  userAvatar: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getUserName() {
    return this.userName;
  }

  getUserAvatar() {
    return this.userAvatar;
  }

  createUser(name: string, email: string, password: string) {
    const authData: AuthData = { name: name, email: email, password: password };
    return this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        userName: string;
        userAvatar: string;
      }>(BACKEND_URL + "/signup", authData)
      .subscribe(
        response => {
          console.log(response);
          this.token = response.token;
          if (response.token) {
            const expiresInDuration = response.expiresIn;
            this.tokenTimer = setTimeout(() => {
              this.logout();
            }, expiresInDuration * 1000);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userName = response.userName;
            this.userAvatar = response.userAvatar;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(
              response.token,
              expirationDate,
              this.userId,
              this.userName,
              this.userAvatar
            );
            this.router.navigate(["/"]);
          }
        },
        error => {
          this.authStatusListener.next(false);
        }
      );
  }

  loginUser(email: string, password: string) {
    this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        userName: string;
        userAvatar: string;
      }>(BACKEND_URL + "/login", { email: email, password: password })
      .subscribe(
        response => {
          this.token = response.token;
          if (response.token) {
            const expiresInDuration = response.expiresIn;
            this.tokenTimer = setTimeout(() => {
              this.logout();
            }, expiresInDuration * 1000);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userName = response.userName;
            this.userAvatar = response.userAvatar;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(
              response.token,
              expirationDate,
              this.userId,
              this.userName,
              this.userAvatar
            );
            this.router.navigate(["/"]);
          }
        },
        error => {
          this.authStatusListener.next(false);
        }
      );
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.userId = null;
    this.userName = null;
    this.userAvatar = null;
    this.router.navigate(["/"]);
    clearTimeout(this.tokenTimer);
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.userId = authInfo.userId;
      this.userName = authInfo.userName;
      this.userAvatar = authInfo.userAvatar;
      this.tokenTimer = setTimeout(() => {
        this.logout();
      }, expiresIn);
      this.authStatusListener.next(true);
    }
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    userName: string,
    userAvatar: string
  ) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", userName);
    localStorage.setItem("userAvatar", userAvatar);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userAvatar = localStorage.getItem("userAvatar");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      userName: userName,
      userAvatar: userAvatar
    };
  }
}
