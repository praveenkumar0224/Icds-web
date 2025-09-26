import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CoursesComponent } from './courses/courses.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from './material.module';
import { AuthService } from './shared/services/auth/auth.service';
import { NotificationService } from './shared/services/notifications/notification.service';

import { CoursesService } from './shared/services/courses/courses.service';
import { NgChartsModule } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import {DashboardServiceService} from './shared/services/dashboard-service.service';
import { AttendanceComponent } from './attendance/attendance.component';
import { DistrictChartComponent } from './district-chart/district-chart.component';
import { GrowthMonitoringComponent } from './growth-monitoring/growth-monitoring.component';
import { MatTableModule } from '@angular/material/table';


@NgModule({
  imports: [
    NgChartsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
     MatSortModule,
     MatTableModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    CoursesComponent,
    CourseDetailsComponent,
    CoursesListComponent,
    LoginComponent,
    AttendanceComponent,
     DistrictChartComponent,
     GrowthMonitoringComponent
   
  ],
  providers: [AuthService, NotificationService,CoursesService,DashboardServiceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
