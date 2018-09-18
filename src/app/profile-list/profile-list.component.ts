import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ProfileService } from "../profile.service";

@Component({
  selector: "app-profile-list",
  templateUrl: "./profile-list.component.html",
  styleUrls: ["./profile-list.component.css"]
})
export class ProfileListComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  isLoading: boolean = false;
  profiles: any[];
  profilesSubs: Subscription;

  constructor(private route: ActivatedRoute, private proService: ProfileService) {}

  ngOnInit() {
    this.isLoading = true;
    this.proService.getAllProfiles();
    this.profilesSubs = this.proService.getProfilesListener().subscribe((profiles: any[]) => {
      this.profiles = profiles;
      this.isLoading = false;
    })
  }

  ngOnDestroy() {
    this.profilesSubs.unsubscribe();
  }
}
