import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ProfileService } from "../profile.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-add-experience",
  templateUrl: "./add-experience.component.html",
  styleUrls: ["./add-experience.component.css"]
})
export class AddExperienceComponent implements OnInit {
  disabled: boolean = false;
  current: boolean = false;
  expForm: FormGroup;
  isLoading: boolean = false;

  constructor(private proService: ProfileService, private router: Router) {}

  ngOnInit() {
    this.expForm = new FormGroup({
      company: new FormControl(null, { validators: [Validators.required] }),
      title: new FormControl(null, { validators: [Validators.required] }),
      location: new FormControl(null),
      from: new FormControl(null, { validators: [Validators.required] }),
      to: new FormControl(null),
      current: new FormControl(null),
      description: new FormControl(null)
    });
  }

  handleCheck() {
    this.disabled = !this.disabled;
    this.current = !this.current;
    if (this.disabled) {
      this.expForm.get("to").disable();
    } else {
      this.expForm.get("to").enable();
    }
  }

  onAddExp() {
    if (this.expForm.invalid) return;
    this.isLoading = true;
    const newExp = {
      company: this.expForm.value.company,
      title: this.expForm.value.title,
      location: this.expForm.value.location,
      from: this.expForm.value.from,
      to: this.expForm.value.to,
      current: this.expForm.value.current,
      description: this.expForm.value.description
    };
    this.proService.addExperience(newExp).subscribe((profile: any) => {
      console.log(profile);
      this.isLoading = false;
      this.expForm.reset();
      this.router.navigate(["/dashboard"]);
    });
  }
}
