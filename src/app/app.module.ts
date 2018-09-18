import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HeaderComponent } from "./header/header.component";
import { PostsService } from "./posts/posts.service";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AuthInterceptor } from "./auth/auth-interceptor";
import { ErrorComponent } from "./error/error.component";
import { ErrorInterceptor } from "./error-interceptor";
import { AngularMaterialModule } from "./angular-material.module";
import { PostsModule } from "./posts/posts.module";
import { ProfileComponent } from "./profile/profile.component";
import { ProfileListComponent } from "./profile-list/profile-list.component";
import { MomentModule } from "angular2-moment";
import { ProfileCreateComponent } from "./profile-create/profile-create.component";
import { ReactiveFormsModule } from "@angular/forms";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AddExperienceComponent } from "./add-experience/add-experience.component";
import { AddEducationComponent } from "./add-education/add-education.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ErrorComponent,
    ProfileComponent,
    ProfileListComponent,
    ProfileCreateComponent,
    DashboardComponent,
    AddExperienceComponent,
    AddEducationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    PostsModule,
    MomentModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [
    PostsService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule {}
