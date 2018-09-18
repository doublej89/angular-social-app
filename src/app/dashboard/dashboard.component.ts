import { Component, OnInit, OnDestroy } from "@angular/core";
import { ProfileService } from "../profile.service";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { faGraduationCap, faUserTie } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit, OnDestroy {
  profile = {};
  profileSubscription: Subscription;
  isLoading: boolean = false;
  userName: string;
  authSubs: Subscription;
  faUserCircle = faUserCircle;
  faGraduationCap = faGraduationCap;
  faUserTie = faUserTie;
  hasProfile = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.authSubs = this.authService
      .getAuthStatusListener()
      .subscribe(authStat => {
        this.userName = this.authService.getUserName();
      });
    this.isLoading = true;
    this.profileSubscription = this.profileService
      .getCurrentProfile()
      .subscribe((proData: any) => {
        this.profile = proData;
        if (Object.keys(this.profile).length > 0) {
          this.hasProfile = true;
        } else {
          this.hasProfile = false;
        }
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe();
    this.authSubs.unsubscribe();
  }
}
