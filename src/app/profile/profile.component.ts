import { Component, OnInit } from "@angular/core";
import { ProfileService } from "../profile.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Profile } from "../profile.model";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  profile: Profile;
  isLoading: boolean = false;
  handle: string;
  firstName: string;
  userId: string;
  noProfile = false;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has("handle")) {
        console.log(params.get("handle"));
        this.isLoading = true;
        this.handle = params.get("handle");
        this.profileService
          .getProfileByHandle(this.handle)
          .subscribe((profile: any) => {
            this.firstName = profile.user.name.trim().split(" ")[0];
            this.profile = {
              user: profile.user,
              handle: profile.handle,
              company: profile.company ? profile.company : null,
              location: profile.location ? profile.location : null,
              gender: profile.gender,
              bio: profile.bio ? profile.bio : null,
              education: profile.education ? profile.education : null,
              experience: profile.experience ? profile.experience : null,
              date: profile.date
            };
            this.isLoading = false;
          });
      } else if (params.has("user_id")) {
        this.isLoading = true;
        this.userId = params.get("user_id");
        this.profileService
          .getProfileById(this.userId)
          .subscribe((profile: any) => {
            if (profile.message) {
              this.noProfile = true;
              this.isLoading = false;
            }
            this.firstName = profile.user.name.trim().split(" ")[0];
            this.profile = {
              user: profile.user,
              handle: profile.handle,
              company: profile.company ? profile.company : null,
              location: profile.location ? profile.location : null,
              gender: profile.gender,
              bio: profile.bio ? profile.bio : null,
              education: profile.education ? profile.education : null,
              experience: profile.experience ? profile.experience : null,
              date: profile.date
            };
            this.isLoading = false;
          });
      }
    });
  }
}
