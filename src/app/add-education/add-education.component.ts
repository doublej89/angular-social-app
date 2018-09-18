import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ProfileService } from "../profile.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-add-education",
  templateUrl: "./add-education.component.html",
  styleUrls: ["./add-education.component.css"]
})
export class AddEducationComponent implements OnInit {
  disabled: boolean = false;
  current: boolean = false;
  eduForm: FormGroup;
  isLoading: boolean = false;

  constructor(private proService: ProfileService, private router: Router) {}

  ngOnInit() {
    this.eduForm = new FormGroup({
      school: new FormControl(null, { validators: [Validators.required] }),
      degree: new FormControl(null, { validators: [Validators.required] }),
      fieldofstudy: new FormControl(null),
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
      this.eduForm.get("to").disable();
    } else {
      this.eduForm.get("to").enable();
    }
  }

  onAddEdu() {
    if (this.eduForm.invalid) return;
    this.isLoading = true;
    const aewEdu = {
      school: this.eduForm.value.school,
      degree: this.eduForm.value.degree,
      fieldofstudy: this.eduForm.value.fieldofstudy,
      from: this.eduForm.value.from,
      to: this.eduForm.value.to,
      current: this.eduForm.value.current,
      description: this.eduForm.value.description
    };
    this.proService.addEducation(aewEdu).subscribe((profile: any) => {
      console.log(profile);
      this.isLoading = false;
      this.eduForm.reset();
      this.router.navigate(["/dashboard"]);
    });
  }
}
