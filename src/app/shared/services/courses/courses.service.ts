//CoursesService

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../../interfaces/course.interface';
import { NotificationService } from '../notifications/notification.service';
import { filter, tap } from 'rxjs/operators';
const BASE_URL = 'http://localhost:3000';


@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  model = 'courses';
  private baseUrl = 'http://3.109.233.193:5412/';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  /* getAllCourses(displayNotification: boolean) {
    if (displayNotification) {
      this.notificationService.notify('Get All Courses HTTP Call');
    }
    return this.http.get<Course[]>(this.getUrl());
  }

  createCourse(course: Course) {
    this.notificationService.notify('Create Course HTTP Call');
    return this.http.post<Course>(this.getUrl(), course);
  }

  updateCourse(course: Course) {
    this.notificationService.notify('Update Course HTTP Call');
    return this.http.put<Course>(this.getUrlWithID(course.id), course);
  }

  deleteCourse(id: number) {
    this.notificationService.notify('Delete Course HTTP Call');
    return this.http.delete(this.getUrlWithID(id));
  }

  private getUrl() {
    return `${BASE_URL}/${this.model}`;
  }

  private getUrlWithID(id) {
    return `${this.getUrl()}/${id}`;
  }

 */


  /* loginWithEmail(): Observable<any> {
    const url = this.baseUrl + 'auth/loginWithEmail';

    const user = {
      email: 'admintechfes@madhifoundation.org',
      password: 'User@123',
    };

    return this.http.post(url, user);
  } */

  loginWithEmail(): Observable<any> {
    const url = this.baseUrl + 'auth/loginWithEmail';
    const user = {
      email: 'admintechfes@madhifoundation.org',
      password: 'User@123',
    };

    return this.http.post(url, user).pipe(
      tap((res: any) => {
        const token = res?.data?.token?.access?.token;
        if (token) {
          localStorage.setItem('access_token', token);
        }
      })
    );
  }


  fetchUser(): Observable<any> {
    const url = this.baseUrl + 'user';
    const token = localStorage.getItem('access_token');
    console.log(token, ';token');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const payload = {
      filter: {
        icds_user_id: 16279,
      },
    };

    return this.http.post(url, payload, { headers });
  }


  //State Api 
  /* getStatewiseData(year, month,districtId,blockId,sectortId): Observable<any> {
    const token = localStorage.getItem('access_token');
    const url = `${this.baseUrl}web-dashboard/state?month=${month}&year=${year}&district_id=${districtId}&block_id=${blockId}&sector_id=${sectortId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Ensure `this.token` is set properly
    });

    return this.http.get(url, { headers });
  } */

  getStatewiseData(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    const params: string[] = [];
  
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (districtId) params.push(`district_id=${districtId}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectortId) params.push(`sector_id=${sectortId}`);
  
    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}web-dashboard/state${queryString}`;
  
    return this.http.get(url, { headers });
  }

  //State Api 
  getDistrictWiseData(districtId,year, month): Observable<any> {
    const token = localStorage.getItem('access_token');
    const url = `${this.baseUrl}web-dashboard/district?district_id=${districtId}&month=${month}&year=${year}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Ensure `this.token` is set properly
    });

    return this.http.get(url, { headers });
  }



  //Masters 
  // district="district_id"
  /* postDistrictData(): Observable<any> {
    const token = localStorage?.getItem('access_token');
    console.log(token,'token');
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    
    return this.http.post(`${this.baseUrl}district/paginate`, { headers });
  } */
  postDistrictData(): Observable<any> {
    const token = localStorage?.getItem('access_token');
    console.log(token, 'token');
    const paylods = {
      filter: {}
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}district/paginate`, paylods, { headers });
  }


  postBlockData(districtId): Observable<any> {
    const token = localStorage?.getItem('access_token');
    console.log(token, 'token');
    const paylods = {
      filter: {"district_id":districtId}
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}block/paginate`, paylods, { headers });
  }


  postSectorData(blockId): Observable<any> {
    const token = localStorage?.getItem('access_token');
    console.log(token, 'token');
    const paylods = {
      filter: {"block_id":blockId}
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}sector/paginate`, paylods, { headers });
  }


 
}
