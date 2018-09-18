import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PostListComponent } from "./posts/post-list/post-list.component";
import { PostCreateComponent } from "./posts/post-create/post-create.component";
import { AuthGuard } from "./auth/auth.guard";
import { ProfileListComponent } from "./profile-list/profile-list.component";
import { ProfileComponent } from "./profile/profile.component";
import { ProfileCreateComponent } from "./profile-create/profile-create.component";
import { AddExperienceComponent } from "./add-experience/add-experience.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { PostComponent } from "./posts/post/post.component";
import { AddEducationComponent } from "./add-education/add-education.component";

const routes: Routes = [
  { path: "", component: PostListComponent },
  { path: "post/:postId", component: PostComponent },
  { path: "create", component: PostCreateComponent, canActivate: [AuthGuard] },
  {
    path: "edit/:postId",
    component: PostCreateComponent,
    canActivate: [AuthGuard]
  },
  { path: "auth", loadChildren: "./auth/auth.module#AuthModule" },
  {
    path: "profiles",
    component: ProfileListComponent
  },
  { path: "profile/:handle", component: ProfileComponent },
  { path: "user-profile/:user_id", component: ProfileComponent },
  {
    path: "create-profile",
    component: ProfileCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "edit-profile",
    component: ProfileCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "add-experience",
    component: AddExperienceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "add-education",
    component: AddEducationComponent,
    canActivate: [AuthGuard]
  },
  { path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
