import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { CoursesComponent } from './courses/courses.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AttendanceComponent } from './attendance/attendance.component';
import { GrowthMonitoringComponent } from './growth-monitoring/growth-monitoring.component';
import { ObservationCompletionComponent } from './observation-completion/observation-completion.component';
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component';
import { observeOn } from 'rxjs';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'courses/:id', component: CoursesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: "growth-monitoring", component: GrowthMonitoringComponent },
  { path: 'observation-completion', component: ObservationCompletionComponent },
 
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  { path: '**', redirectTo: '/observation-completion' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
