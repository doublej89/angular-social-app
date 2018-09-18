import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, ParamMap, UrlSegment } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ProfileService } from "../profile.service";
import { Profile } from "../profile.model";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-profile-create",
  templateUrl: "./profile-create.component.html",
  styleUrls: ["./profile-create.component.css"]
})
export class ProfileCreateComponent implements OnInit, OnDestroy {
  genders = ["Male", "Female"];
  isLoading: boolean = false;
  editMode: boolean = false;
  form: FormGroup;
  profile: Profile;
  private authStatusSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      handle: new FormControl(null, { validators: Validators.required }),
      genderOption: new FormControl(null, { validators: Validators.required }),
      company: new FormControl(null),
      location: new FormControl(null),
      bio: new FormControl(null)
    });
    this.route.url.subscribe((urlSeg: UrlSegment[]) => {
      if (urlSeg[0].path === "edit-profile") {
        this.editMode = true;
        this.isLoading = true;
        this.profileService.getCurrentProfile().subscribe((profile: any) => {
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
          this.form.setValue({
            handle: this.profile.handle,
            genderOption: this.profile.gender,
            company: this.profile.company,
            location: this.profile.location,
            bio: this.profile.bio
          });
        });
      } else {
        this.editMode = false;
        this.profile = null;
      }
    });
  }

  onSaveProfile() {
    if (this.form.invalid) return;
    this.isLoading = true;
    const newOrUpdatedProfile = {
      handle: this.form.value.handle,
      company: this.form.value.company,
      location: this.form.value.location,
      bio: this.form.value.bio,
      gender: this.form.value.genderOption
    };
    this.profileService.addOrUpdateProfile(newOrUpdatedProfile);
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
