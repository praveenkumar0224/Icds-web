import { Component } from '@angular/core';
import { shareReplay } from 'rxjs/operators';

import { AuthService } from './shared/services/auth/auth.service';
import { DashboardServiceService } from './shared/services/dashboard-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ICDS Supervision - Dashboard';
  links = [
    { path: '/home', icon: 'visibility', title: 'Observation' },
    { path: '/attendance', icon: 'event_note', title: 'Attendance' },
    { path: '/growth-monitoring', icon: 'assessment', title: 'Growth Monitoring' },
  ];
  deCryptedId: any



  isAuthenticated$ = this.authService.isAuthenticated$.pipe(shareReplay(1));

  constructor(private authService: AuthService,
    private service: DashboardServiceService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
  ) {}


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      
      const encryptedId = params['user_id']; // fetch dynamically
      if (encryptedId) {
        this.deCryptedId = this.service.decryptUserId(encryptedId);
        console.log(this.deCryptedId, 'decrypted user_id');
      }
    });

    this.service
      .loginWithEmail(this.deCryptedId)
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.openToast('success');
        },
        error: (error) => {
          console.error('Login failed', error);
          this.openToast('error');
        },
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



  logout() {
    this.authService.logout();
  }
}
