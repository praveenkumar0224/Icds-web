import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { CoursesComponent } from './courses/courses.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AttendanceComponent } from './attendance/attendance.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'courses/:id', component: CoursesComponent },
  { path: 'login', component: LoginComponent },
  {path:'attendance', component: AttendanceComponent},
  
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
