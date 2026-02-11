import { Component } from '@angular/core';
import { shareReplay } from 'rxjs/operators';

import { AuthService } from './shared/services/auth/auth.service';
import { DashboardServiceService } from './shared/services/dashboard-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { MatSidenav } from '@angular/material/sidenav';
import { ViewChild } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {


  @ViewChild('sidenav') sidenav!: MatSidenav;
  title = 'ICDS Supervision - Dashboard';
  links = [
    // { path: '/home', icon: 'visibility', title: 'Observation' },
    { path: '/observation-completion', icon: 'visibility', title: 'Observation Completion' },
    { path: '/attendance', icon: 'event_note', title: 'Attendance' },
    { path: '/growth-monitoring', icon: 'assessment', title: 'Growth Monitoring' },
   
    
  ];
  deCryptedId: any
  isDistrictUser = true;
  isBlockUser = true;
  isStateUser = true
  isAccess = false;
  isAuthenticated$ = this.authService.isAuthenticated$.pipe(shareReplay(1));

  constructor(private authService: AuthService,
    private service: DashboardServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params, '========awcmonitor', environment);
  
      const user_id = params['user_id'];
      if (!user_id) return;
  
      // ✅ Env-based logic
      this.deCryptedId = environment.production
        ? this.service.decryptUserId(user_id)
        : user_id;
  
      console.log(this.deCryptedId, 'final user_id');
  
      // ✅ LOGIN ONLY AFTER ID IS READY
      this.login(this.deCryptedId);
    });

  }

  openToast(type: 'success' | 'error') {
    this.snackBar.open(
      type === 'success' ? 'Login Successful ✅' : 'Something went wrong ❌',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: type === 'success' ? ['toast-success'] : ['toast-error'],
      }
    );
  }
  getRole(role: string): void {

    // Reset all flags first
    this.isDistrictUser = false;
    this.isBlockUser = false;
    this.isStateUser = false;
    this.isAccess = true;
  
    switch (role) {
      case "DPO":
      case "District Collector":
      case "District Coordinator":
        this.isDistrictUser = true;
        break;
  
      case "CDPO":
        this.isBlockUser = true;
        break;
  
      case "Root":
      case "Zone Officer":
        this.isStateUser = true;
        break;
  
      case "Block Supervisor":
        this.isAccess = false;
        break;
  
      default:
        this.isAccess = false;
    }
  
    console.log(this.isAccess, 'isAccess');
  
    // 🚨 Redirect if no access
    if (!this.isAccess) {
      this.router.navigate(['/access-denied']);
    }
  }
  

  private login(userId: string): void {
    this.service.loginWithEmail(userId).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.openToast('success');
        const user = response?.data?.user
        this.getRole(user?.role?.role_name)
      },
      error: (error) => {
        console.error('Login failed', error);
        this.openToast('error');
      },
    });
  }
  
  logout() {
    this.authService.logout();
  }
}
