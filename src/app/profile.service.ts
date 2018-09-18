import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

const BACKEND_URL = "/api/profile/";

@Injectable({ providedIn: "root" })
export class ProfileService {
  private profiles: any[];
  private profilesEventListener = new Subject<any[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getProfileByHandle(handle: string) {
    return this.http.get(BACKEND_URL + "handle/" + handle);
  }

  getProfileById(user_id: string) {
    return this.http.get(BACKEND_URL + "user/" + user_id);
  }

  getCurrentProfile() {
    return this.http.get(BACKEND_URL);
  }

  getAllProfiles() {
    this.http.get(BACKEND_URL + "all").subscribe((profiles: any[]) => {
      this.profiles = profiles;
      this.profilesEventListener.next([...this.profiles]);
    });
  }

  addExperience(exp: any) {
    return this.http.post(BACKEND_URL + "experience", exp);
  }

  addEducation(edu: any) {
    return this.http.post(BACKEND_URL + "education", edu);
  }

  getProfilesListener() {
    return this.profilesEventListener.asObservable();
  }

  addOrUpdateProfile(profile: any) {
    this.http.post(BACKEND_URL, profile).subscribe((profile: any) => {
      console.log(profile);
      this.router.navigate([`/profile/${profile.handle}`]);
    });
  }
}
