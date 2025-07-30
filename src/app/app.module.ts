import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AdminPayrollComponent } from './examples/child-routes/admin-payroll/admin-payroll.component';
import { AdminVacationComponent } from './examples/child-routes/admin-vacation/admin-vacation.component';
import { AdminComponent } from './examples/child-routes/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { SectorComponent } from './courses/sector.component';
import { DynamicComponent } from './examples/dynamic-component/dynamic-component.component';
import { DistrictComponent } from './examples/district.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from './material.module';
import { AuthService } from './shared/services/auth/auth.service';
import { NotificationService } from './shared/services/notifications/notification.service';
import { CircleComponent } from './examples/dynamic-component/circle/circle.component';
import { SquareComponent } from './examples/dynamic-component/square/square.component';
import { TriangleComponent } from './examples/dynamic-component/triangle/triangle.component';
import { CustomInputComponent } from './examples/custom-input/custom-input.component';
import { CustomControlComponent } from './examples/custom-input/custom-control/custom-control.component';
import { RouteParamsComponent } from './examples/route-params/route-params.component';
import { ProtectedComponent } from './examples/protected/protected.component';

import { CoursesService } from './shared/services/courses/courses.service';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { SideMenuComponent } from './side-menu/side-menu.component'


@NgModule({
  imports: [
    NgChartsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    // Material Modules
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    

  ],
  declarations: [
    AppComponent,
    HomeComponent,
    SectorComponent,
    CourseDetailsComponent,
    CoursesListComponent,
    LoginComponent,
    AdminComponent,
    AdminPayrollComponent,
    AdminVacationComponent,
    DistrictComponent,
    DynamicComponent,
    CircleComponent,
    SquareComponent,
    TriangleComponent,
    CustomInputComponent,
    CustomControlComponent,
    RouteParamsComponent,
    ProtectedComponent,
    SideMenuComponent
    
  ],
  providers: [AuthService, NotificationService,CoursesService],
  bootstrap: [AppComponent],
})
export class AppModule {}
