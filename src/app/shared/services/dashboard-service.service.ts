import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from './notifications/notification.service';
import { filter, tap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class DashboardServiceService {
  model = 'courses';
  private baseUrl = environment.apiUrl

  xenovexUrl = "https://icds.xenovex.com/awcmonitor/home?user_id=OdRwtt9rSR0rMc3aLLgYCMSTN6ksGFVY3x%2B9SluU0NY%3D"
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  loginWithEmail(id: any): Observable<any> {
  
    
    const url = this.baseUrl + 'auth/loginWithEmail';
    const user = {
      email: 'admintechfes@madhifoundation.org',
      password: 'User@123',
      icds_user_id: id ? parseInt(id) : 67383,
    };

    return this.http.post(url, user).pipe(
      tap((res: any) => {
       
        const token = res?.data?.token?.access?.token;
        if (token) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('user', JSON.stringify(res?.data?.user));
        }
      })
    );
  }


  fetchUser(id: any): Observable<any> {
    const url = this.baseUrl + 'user';
    const token = localStorage.getItem('access_token');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const payload = {
      filter: {
        icds_user_id: id ? parseInt(id) : 8812,
      },
    };

    return this.http.post(url, payload, { headers });
  }


  // Decript 


  /* decryptUserId(encryptedUserId: string, secretKey: string): string {
    // Decode the URL-encoded string
    const decodedEncryptedUserId = decodeURIComponent(encryptedUserId);
    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt(decodedEncryptedUserId, secretKey);
    console.log(decrypted,'decrypted');
    
    const originalId = decrypted.toString(CryptoJS.enc.Utf8);
  
    console.log('Decrypted User ID:', originalId);
    return originalId;
  }
   */
  decryptUserId(cipherText: string, keyString: string = 'wK79akQyH6ED2zebWes5OKAKwMYje3Mn'): string {
    try {
      // Decode Base64 string into WordArray
      const fullCipher = CryptoJS.enc.Base64.parse(cipherText);

      // Extract IV (first 16 bytes) and cipher (next 16 bytes)
      const iv = CryptoJS.lib.WordArray.create(fullCipher.words.slice(0, 4));  // 4 words = 16 bytes
      const cipher = CryptoJS.lib.WordArray.create(fullCipher.words.slice(4, 8)); // next 16 bytes

      // Convert key string to WordArray
      const key = CryptoJS.enc.Utf8.parse(keyString);

      // Decrypt using AES CBC mode with extracted IV
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: cipher },
        key,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      console.log('Decrypted User ID:', decryptedText);
      return decryptedText;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }




  getStatewiseData(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);

    /*  if (districtId) params.push(`district_id=${districtId}`);
     if (blockId) params.push(`block_id=${blockId}`);
     if (sectortId) params.push(`sector_id=${sectortId}`); */

    /*  if (districtId && blockId && sectortId) {
       params.push(`block_id=${blockId}`);
     } else if (districtId && blockId) {
       params.push(`district_id=${districtId}`);
     } else if (districtId) {
       params.push(`district_id=${districtId}`);
     }
  */
    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;

    if (districtId && blockId) {
      url = `${this.baseUrl}web-dashboard/block${queryString}`;
    } else if (districtId) {
      url = `${this.baseUrl}web-dashboard/district${queryString}`;
    } else {
      url = `${this.baseUrl}web-dashboard/state${queryString}`;
    }

    /*  if (districtId && blockId && sectortId) {
       url = `${this.baseUrl}web-dashboard/block${queryString}`;
     } else if (districtId && blockId) {
       url = `${this.baseUrl}web-dashboard/district${queryString}`;
     } else if (districtId) {
       url = `${this.baseUrl}web-dashboard/state${queryString}`;
     }else{
       url = `${this.baseUrl}web-dashboard/state${queryString}`;
     } */


    return this.http.get(url);
  }

  getStatewiseDataForAttandance(
    year?: string,
    month?: string,
    districtId?: string,
    blockId?: string,
    sectortId?: string,
    selectedUser?: string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`);

    /*  if (districtId) params.push(`district_id=${districtId}`);
     if (blockId) params.push(`block_id=${blockId}`);
     if (sectortId) params.push(`sector_id=${sectortId}`); */

    /*  if (districtId && blockId && sectortId) {
       params.push(`block_id=${blockId}`);
     } else if (districtId && blockId) {
       params.push(`district_id=${districtId}`);
     } else if (districtId) {
       params.push(`district_id=${districtId}`);
     }
  */
    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;

    if (districtId && blockId) {
      url = `${this.baseUrl}web-dashboard/attendance/block${queryString}`;
    } else if (districtId) {
      url = `${this.baseUrl}web-dashboard/attendance/district${queryString}`;
    } else {
      url = `${this.baseUrl}web-dashboard/attendance/state${queryString}`;
    }

    /*  if (districtId && blockId && sectortId) {
       url = `${this.baseUrl}web-dashboard/block${queryString}`;
     } else if (districtId && blockId) {
       url = `${this.baseUrl}web-dashboard/district${queryString}`;
     } else if (districtId) {
       url = `${this.baseUrl}web-dashboard/state${queryString}`;
     }else{
       url = `${this.baseUrl}web-dashboard/state${queryString}`;
     } */


    return this.http.get(url);
  }



  getgmDashboardByobservation(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
    if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/by-observation${queryString}`;

    return this.http.get(url);
  }

  getgmDashboardByawc(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
    if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/by-awc${queryString}`;

    return this.http.get(url);
  }

  getgmBySupervisor(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
    if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/by-superviser${queryString}`;

    return this.http.get(url);
  }

  getgmTrendsBySupervisor(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
      if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/trends-by-superviser${queryString}`;

    return this.http.get(url);
  }

  getgmAgegroupDeviation(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
    if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/by-age${queryString}`;

    return this.http.get(url);
  }

  getgmHierarchicalDeviation(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string, orderBy?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
    if (orderBy) params.push(`orderBy=${orderBy}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/by-hierarchical${queryString}`;

    return this.http.get(url);
  }

  getDeviationByAwwSuperviosr(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string, deviationCategory?: string,selectedUser?:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (deviationCategory) params.push(`deviation_category=${deviationCategory}`)
    if (selectedUser) params.push(`observation_type=${selectedUser}`)

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;
    url = `${this.baseUrl}webDashboard-gm/by-compare-AWW-supervisor${queryString}`;

    return this.http.get(url);
  }








  getDistrictWiseData(districtId?: string, year?: string, month?: string, sectorId?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}web-dashboard/district${queryString}`;

    return this.http.get(url);
  }


  lineTableExcelDownload(
    districtId?: string,
    year?: string,
    month?: string,
    sectorId?: string,
    blockId?: string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-dashboard/blocks${queryString}`;
    } else if (districtId) {
      url = `${this.baseUrl}web-dashboard/districts${queryString}`;
    } else if (sectorId) {
      url = `${this.baseUrl}web-dashboard/sector${queryString}`;
    }
    else {
      url = `${this.baseUrl}web-dashboard${queryString}`;
    }

    return this.http.get(url, { responseType: 'blob' });
  }

  AttendancelineTableExcelDownload(
    districtId?: string,
    year?: string,
    month?: string,
    sectorId?: string,
    blockId?: string,
    selectedUser?:string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`)
    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-dashboard/attendance-blockWiseReport-excel${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-dashboard/attendance-report-excel${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-dashboard/attendance-sectorWiseReport-excel${queryString}`;
    }

    return this.http.get(url, { responseType: 'blob' });
  }


  GMlineTableExcelDownload(
    districtId?: string,
    year?: string,
    month?: string,
    sectorId?: string,
    blockId?: any,
    selectedUser?:string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];
    console.log("blockId value:", blockId);

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
     if (blockId) {
        const finalBlockId =
          typeof blockId === 'object' ? blockId.id : blockId;

        params.push(`block_id=${encodeURIComponent(finalBlockId)}`);
      }
    if (sectorId) params.push(`sector_id=${sectorId}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`)
    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}webDashboard-gm/gmblockWiseReport-excel${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}webDashboard-gm/gmdistrictwise-report-excel${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}webDashboard-gm/gmsectorWiseReport-excel${queryString}`;
    }

    return this.http.get(url, { responseType: 'blob' });
  }



  supervisorObs(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/by-observation-supervisor${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/by-observation-supervisor${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/by-observation-supervisor${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/by-observation-supervisor${queryString}`;
    }

    return this.http.get<any>(url, { headers });
  }

  CDPOObs(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/by-observation-cdpo${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/by-observation-cdpo${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/by-observation-cdpo${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/by-observation-cdpo${queryString}`;
    }

    return this.http.get<any>(url, { headers });
  }

  supervisorActive(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/by-active-supervisor${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/by-active-supervisor${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/by-active-supervisor${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/by-active-supervisor${queryString}`;
    }

    return this.http.get<any>(url, { headers });
  }

  CDPOActive(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/by-active-cdpo${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/by-active-cdpo${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/by-active-cdpo${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/by-active-cdpo${queryString}`;
    }

    return this.http.get<any>(url, { headers });
  }

  DPOActive(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/by-active-dpo${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/by-active-dpo${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/by-active-dpo${queryString}`;
    } else[
      url = `${this.baseUrl}web-observation-completion/by-active-dpo${queryString}`
    ]

    return this.http.get<any>(url, { headers });
  }

  awcObservedBySupervisor(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-by-supervisor${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-by-supervisor${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-by-supervisor${queryString}`;
    } else[
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-by-supervisor${queryString}`
    ]

    return this.http.get<any>(url, { headers });
  }

  awcObservedQuarterByDPO(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-dpo${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-dpo${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-dpo${queryString}`;
    } else[
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-dpo${queryString}`
    ]

    return this.http.get<any>(url, { headers });
  }
  unVisitedAwcCountSupervisor(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/unvisited-awc-count-supervisor${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/unvisited-awc-count-supervisor${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/unvisited-awc-count-supervisor${queryString}`;
    } else[
      url = `${this.baseUrl}web-observation-completion/unvisited-awc-count-supervisor${queryString}`
    ]

    return this.http.get<any>(url, { headers });
  }

  awcObservedQuarterByCDPO(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-cdpo${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-cdpo${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-cdpo${queryString}`;
    } else[
      url = `${this.baseUrl}web-observation-completion/get-awc-observed-quarter-by-cdpo${queryString}`
    ]

    return this.http.get<any>(url, { headers });
  }


  getSectorsObservedByDPO(
    districtId?: string,
    year?: string,
    month?: string,
    blockId?: string,
    sectorId?: string,
   
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);

    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/get-sectors-observed-by-dpo${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-sectors-observed-by-dpo${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/get-sectors-observed-by-dpo${queryString}`;
    } else[
      url = `${this.baseUrl}web-observation-completion/get-sectors-observed-by-dpo${queryString}`
    ]

    return this.http.get<any>(url, { headers });
  }

 

  getObservationCompletionForSupervisor(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);


    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;

    if (districtId && blockId) {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-supervisor${queryString}`;
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-supervisor${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-supervisor${queryString}`;
    }

    return this.http.get(url);
  }

  getObservationCompletionForDPO(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);


    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;

    if (districtId && blockId) {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-dpo${queryString}`;
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-dpo${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-dpo${queryString}`;
    }

    return this.http.get(url);
  }

  getObservationCompletionForCDPO(year?: string, month?: string, districtId?: string, blockId?: string, sectortId?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);


    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    } if (districtId) {
      params.push(`district_id=${districtId}`);
    }


    const queryString = params.length ? '?' + params.join('&') : '';


    let url: string;

    if (districtId && blockId) {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-cdpo${queryString}`;
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-cdpo${queryString}`;
    } else {
      url = `${this.baseUrl}web-observation-completion/get-observation-completion-for-cdpo${queryString}`;
    }

    return this.http.get(url);
  }

  getObsCompletetionExcelSupervisor(
    districtId?: string,
    year?: any,
    month?: string,
    blockId?: string,
    sectorId?:string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);


   console.log(blockId,"blockId",districtId);
   
    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/excel-block${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/excel${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/excel-sector${queryString}`;
      
    } 


    return this.http.get(url, { responseType: 'blob' });
  }
  getObsCompletetionExcelCDPO(
    districtId?: string,
    year?: any,
    month?: string,
    blockId?: string,
    sectorId?:string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);


   console.log(blockId,"blockId",districtId);
   
    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/cdpo-excel-block${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/cdpo-excel-district${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/cdpo-excel-sector${queryString}`;
      
    } 


    return this.http.get(url, { responseType: 'blob' });
  }
  getObsCompletetionExcelDPO(
    districtId?: string,
    year?: any,
    month?: string,
    blockId?: string,
    sectorId?:string
  ): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params: string[] = [];

    if (districtId) params.push(`district_id=${districtId}`);
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (blockId) params.push(`block_id=${blockId}`);
    if (sectorId) params.push(`sector_id=${sectorId}`);


   console.log(blockId,"blockId",districtId);
   
    const queryString = params.length ? '?' + params.join('&') : '';

    let url = '';
    if (blockId) {
      url = `${this.baseUrl}web-observation-completion/dpo-excel-block${queryString}`;
      
    } else if (districtId) {
      url = `${this.baseUrl}web-observation-completion/dpo-excel-district${queryString}`;
      
    } else if (sectorId) {
      url = `${this.baseUrl}web-observation-completion/dpo-excel-sector${queryString}`;
      
    } 


    return this.http.get(url, { responseType: 'blob' });
  }


   // ─── ECCE Observation Methods ────────────────────────────────────────────────

  getEcceObservationMetrics(
    year?: string,
    month?: string,
    districtId?: string,
    blockId?: string,
    sectorId?: string,
    selectedUser?: string
  ): Observable<any> {
    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`);

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    }
    if (districtId) {
      params.push(`district_id=${districtId}`);
    }

    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}ecce-observation-dashboard/ecce-observation-summary${queryString}`;

    return this.http.get(url);
  }

  // ─── ECCE Monitoring — Individual Metric Methods ─────────────────────────────

getEcceMonitoringAwcsObserved(
  year?: string, month?: string,
  districtId?: string, blockId?: string,
  sectorId?: string, selectedUser?: string
): Observable<any> {
  return this.http.get(this.buildEcceMonitoringUrl('awcs-observed', year, month, districtId, blockId, sectorId, selectedUser));
}

getEcceMonitoringTotalChildrenAssessed(
  year?: string, month?: string,
  districtId?: string, blockId?: string,
  sectorId?: string, selectedUser?: string
): Observable<any> {
  return this.http.get(this.buildEcceMonitoringUrl('total-children-assessed', year, month, districtId, blockId, sectorId, selectedUser));
}

getEcceMonitoringAverageAssessmentScore(
  year?: string, month?: string,
  districtId?: string, blockId?: string,
  sectorId?: string, selectedUser?: string
): Observable<any> {
  return this.http.get(this.buildEcceMonitoringUrl('average-assessment-score', year, month, districtId, blockId, sectorId, selectedUser));
}

getEcceMonitoringChildrenAbove8Letters(
  year?: string, month?: string,
  districtId?: string, blockId?: string,
  sectorId?: string, selectedUser?: string
): Observable<any> {
  return this.http.get(this.buildEcceMonitoringUrl('children-above-8-letters', year, month, districtId, blockId, sectorId, selectedUser));
}

getEcceMonitoringChildrenBelow4Letters(
  year?: string, month?: string,
  districtId?: string, blockId?: string,
  sectorId?: string, selectedUser?: string
): Observable<any> {
  return this.http.get(this.buildEcceMonitoringUrl('children-below-4-letters', year, month, districtId, blockId, sectorId, selectedUser));
}

private buildEcceMonitoringUrl(
  endpoint: string,
  year?: string, month?: string,
  districtId?: string, blockId?: string,
  sectorId?: string, selectedUser?: string
): string {
  const params: string[] = [];
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);
  if (districtId && blockId) params.push(`block_id=${blockId}`);
  if (districtId) params.push(`district_id=${districtId}`);
  const queryString = params.length ? '?' + params.join('&') : '';
  return `${this.baseUrl}ecce-monitering-dashboard/${endpoint}${queryString}`;
}

  getEcceMonthwiseTrend(
    year?: string,
    month?: string,
    districtId?: string,
    blockId?: string,
    sectorId?: string,
    selectedUser?: string
  ): Observable<any> {
    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`);

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    }
    if (districtId) {
      params.push(`district_id=${districtId}`);
    }

    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}ecce-observation-dashboard/monthwise${queryString}`;

    return this.http.get(url);
  }

  getEcceUserwiseTrend(
    year?: string,
    month?: string,
    districtId?: string,
    blockId?: string,
    sectorId?: string,
    selectedUser?: string
  ): Observable<any> {
    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`);

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    }
    if (districtId) {
      params.push(`district_id=${districtId}`);
    }

    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}ecce-observation-dashboard/userwise-breakdown${queryString}`;

    return this.http.get(url);
  }

  getEcceDistrictwiseTrend(
    year?: string,
    month?: string,
    districtId?: string,
    blockId?: string,
    sectorId?: string,
    cadreType?: string
  ): Observable<any> {
    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (cadreType) params.push(`cadre_type=${cadreType}`);

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    }
    if (districtId) {
      params.push(`district_id=${districtId}`);
    }

    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}webDashboard-ecce/districtwise-trend${queryString}`;

    return this.http.get(url);
  }

  getEcceHierarchicalData(
    year?: string,
    month?: string,
    districtId?: string,
    blockId?: string,
    sectorId?: string,
    selectedUser?: string
  ): Observable<any> {
    const params: string[] = [];

    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (selectedUser) params.push(`observation_type=${selectedUser}`);

    if (districtId && blockId) {
      params.push(`block_id=${blockId}`);
    }
    if (districtId) {
      params.push(`district_id=${districtId}`);
    }

    const queryString = params.length ? '?' + params.join('&') : '';
    const url = `${this.baseUrl}ecce-observation-dashboard/table-view${queryString}`;

    return this.http.get(url);
  }

        getEcceMonitoringMetrics(
        year?: string,
        month?: string,
        districtId?: string,
        blockId?: string,
        sectorId?: string,
        selectedUser?: string
      ): Observable<any> {
        const params: string[] = [];
      
        if (month) params.push(`month=${month}`);
        if (year) params.push(`year=${year}`);
        if (selectedUser) params.push(`observation_type=${selectedUser}`);
      
        if (districtId && blockId) {
          params.push(`block_id=${blockId}`);
        }
        if (districtId) {
          params.push(`district_id=${districtId}`);
        }
      
        const queryString = params.length ? '?' + params.join('&') : '';
        const url = `${this.baseUrl}webDashboard-ecce-monitoring/metrics${queryString}`;
      
        return this.http.get(url);
      }
          getEcceMonitoringMonthwiseTrend(
      year?: string,
      month?: string,
      districtId?: string,
      blockId?: string,
      sectorId?: string,
      selectedUser?: string
    ): Observable<any> {
      const params: string[] = [];
    
      if (month) params.push(`month=${month}`);
      if (year) params.push(`year=${year}`);
      if (selectedUser) params.push(`observation_type=${selectedUser}`);
    
      if (districtId && blockId) {
        params.push(`block_id=${blockId}`);
      }
      if (districtId) {
        params.push(`district_id=${districtId}`);
      }
    
      const queryString = params.length ? '?' + params.join('&') : '';
      const url = `${this.baseUrl}ecce-monitering-dashboard/monthly-assessment-score-trend${queryString}`;
    
      return this.http.get(url);
    }

       getEcceMonitoringUserwiseTrend(
  year?: string,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];
 
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);

  if (districtId && blockId) {
    params.push(`block_id=${blockId}`);
  }
  if (districtId) {
    params.push(`district_id=${districtId}`);
  }
 
  const queryString = params.length ? '?' + params.join('&') : '';
  const url = `${this.baseUrl}ecce-monitering-dashboard/learning-category-comparison${queryString}`;
 
  return this.http.get(url);
}

     getEcceMonitoringDistrictwiseTrend(
  year?: string,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  cadreType?: string
): Observable<any> {
  const params: string[] = [];
 
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (cadreType) params.push(`cadre_type=${cadreType}`);
 
  if (districtId && blockId) {
    params.push(`block_id=${blockId}`);
  }
  if (districtId) {
    params.push(`district_id=${districtId}`);
  }
 
  const queryString = params.length ? '?' + params.join('&') : '';
  const url = `${this.baseUrl}webDashboard-ecce-monitoring/districtwise-trend${queryString}`;
 
  return this.http.get(url);
}

      getEcceMonitoringHierarchicalData(
  year?: string,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];
 
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);
 
  if (districtId && blockId) {
    params.push(`block_id=${blockId}`);
  }
  if (districtId) {
    params.push(`district_id=${districtId}`);
  }
 
  const queryString = params.length ? '?' + params.join('&') : '';
  const url = `${this.baseUrl}ecce-monitering-dashboard/table-view${queryString}`;
 
  return this.http.get(url);
}
 
 
   ecceExcelDownload(
  districtId?: string,
  year?: string,
  month?: string,
  sectorId?: string,
  blockId?: any,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];

  if (districtId) params.push(`district_id=${districtId}`);
  if (month)      params.push(`month=${month}`);
  if (year)       params.push(`year=${year}`);
  if (blockId) {
    const finalBlockId = typeof blockId === 'object' ? blockId.id : blockId;
    params.push(`block_id=${encodeURIComponent(finalBlockId)}`);
  }
  if (sectorId)     params.push(`sector_id=${sectorId}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);

  const queryString = params.length ? '?' + params.join('&') : '';

  // ─── URL routing: most specific first ───────────────────
  let url = '';
  if (sectorId) {
    // district + block + sector → sectorwise report
    url = `${this.baseUrl}ecce-observation-dashboard/excel${queryString}`;
  } else if (blockId) {
    // district + block → blockwise report
    url = `${this.baseUrl}ecce-observation-dashboard/excel${queryString}`;
  } else {
    // district only → districtwise report
    url = `${this.baseUrl}ecce-observation-dashboard/excel${queryString}`;
  }

  return this.http.get(url, { responseType: 'blob' });
}

     ecceMonitoringExcelDownload(
  districtId?: string,
  year?: string,
  month?: string,
  sectorId?: string,
  blockId?: any,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];

  if (districtId) params.push(`district_id=${districtId}`);
  if (month)      params.push(`month=${month}`);
  if (year)       params.push(`year=${year}`);
  if (blockId) {
    const finalBlockId = typeof blockId === 'object' ? blockId.id : blockId;
    params.push(`block_id=${encodeURIComponent(finalBlockId)}`);
  }
  if (sectorId)     params.push(`sector_id=${sectorId}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);

  const queryString = params.length ? '?' + params.join('&') : '';

  // ─── URL routing: most specific first ───────────────────
  let url = '';
  if (sectorId) {
    // district + block + sector → sectorwise report
    url = `${this.baseUrl}ecce-monitering-dashboard/excel${queryString}`;
  } else if (blockId) {
    // district + block → blockwise report
    url = `${this.baseUrl}ecce-monitering-dashboard/excel${queryString}`;
  } else {
    // district only → districtwise report
    url = `${this.baseUrl}ecce-monitering-dashboard/excel${queryString}`;
  }

  return this.http.get(url, { responseType: 'blob' });
}


     // ─── HCM Inspection Methods ──────────────────────────────────────────────────

getHcmInspectionMetrics(
  year?: any,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];

  if (month)        params.push(`month=${month}`);
  if (year)         params.push(`year=${year}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);
  if (districtId && blockId) params.push(`block_id=${blockId}`);
  if (districtId)   params.push(`district_id=${districtId}`);

  const queryString = params.length ? '?' + params.join('&') : '';
  return this.http.get(`${this.baseUrl}hcm-dashboard/hcm-kpis${queryString}`);
}

getHcmMonthwiseTrend(
  year?: any,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  selectedUser?: string,
  indicator?: string
): Observable<any> {
  const params: string[] = [];

  if (month)        params.push(`month=${month}`);
  if (year)         params.push(`year=${year}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);
  if (indicator)    params.push(`metric=${indicator}`);
  if (districtId && blockId) params.push(`block_id=${blockId}`);
  if (districtId)   params.push(`district_id=${districtId}`);

  const queryString = params.length ? '?' + params.join('&') : '';
  return this.http.get(`${this.baseUrl}hcm-dashboard/monthwise${queryString}`);
}

getHcmUserwiseTrend(
  year?: any,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  cadreType?: string
): Observable<any> {
  const params: string[] = [];

  if (month)      params.push(`month=${month}`);
  if (year)       params.push(`year=${year}`);
  if (cadreType)  params.push(`cadre_type=${cadreType}`);
  if (districtId && blockId) params.push(`block_id=${blockId}`);
  if (districtId) params.push(`district_id=${districtId}`);

  const queryString = params.length ? '?' + params.join('&') : '';
  return this.http.get(`${this.baseUrl}hcm-dashboard/userwise-breakdown${queryString}`);
}

getHcmDistrictwiseTrend(
  year?: any,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  cadreType?: string
): Observable<any> {
  const params: string[] = [];

  if (month)      params.push(`month=${month}`);
  if (year)       params.push(`year=${year}`);
  if (cadreType)  params.push(`cadre_type=${cadreType}`);
  if (districtId && blockId) params.push(`block_id=${blockId}`);
  if (districtId) params.push(`district_id=${districtId}`);

  const queryString = params.length ? '?' + params.join('&') : '';
  return this.http.get(`${this.baseUrl}hcm-dashboard/districtwise-trend${queryString}`);
}

getHcmHierarchicalData(
  year?: any,
  month?: string,
  districtId?: string,
  blockId?: string,
  sectorId?: string,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];

  if (month)        params.push(`month=${month}`);
  if (year)         params.push(`year=${year}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);
  if (districtId && blockId) params.push(`block_id=${blockId}`);
  if (districtId)   params.push(`district_id=${districtId}`);

  const queryString = params.length ? '?' + params.join('&') : '';
  return this.http.get(`${this.baseUrl}hcm-dashboard/table-view${queryString}`);
}

hcmExcelDownload(
  districtId?: string,
  year?: any,
  month?: string,
  sectorId?: string,
  blockId?: any,
  selectedUser?: string
): Observable<any> {
  const params: string[] = [];

  if (districtId)   params.push(`district_id=${districtId}`);
  if (month)        params.push(`month=${month}`);
  if (year)         params.push(`year=${year}`);
  if (blockId) {
    const finalBlockId = typeof blockId === 'object' ? blockId.id : blockId;
    params.push(`block_id=${encodeURIComponent(finalBlockId)}`);
  }
  if (sectorId)     params.push(`sector_id=${sectorId}`);
  if (selectedUser) params.push(`observation_type=${selectedUser}`);

  const queryString = params.length ? '?' + params.join('&') : '';
  return this.http.get(
    `${this.baseUrl}hcm-dashboard/excel${queryString}`,
    { responseType: 'blob' }
  );
}
  postDistrictData(): Observable<any> {
    const token = localStorage?.getItem('access_token');
    // console.log(token, 'token');
    const paylods = {
      filter: {}
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}district/paginate`, paylods);
  }
  postDistrictDatWithFilter(filter): Observable<any> {
    const token = localStorage?.getItem('access_token');
    // console.log(token, 'token');
    // const paylods = {
    //   filter,options
    // }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}district/paginate`, filter);
  }


  postBlockDataWithFilter(filter): Observable<any> {
    const token = localStorage?.getItem('access_token');
    //console.log(token, 'token');
    const paylods = {
      filter
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}block/paginate`, paylods);
  }


  postBlockData(districtId): Observable<any> {
    const token = localStorage?.getItem('access_token');
    //console.log(token, 'token');
    const paylods = {
      filter: { "district_id": districtId }
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}block/paginate`, paylods);
  }


  postSectorData(blockId): Observable<any> {
    console.log(blockId, "inside api");

    const token = localStorage?.getItem('access_token');
    //console.log(token, 'token');
    const paylods = {
      filter: { "block_id": blockId },

    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}sector/paginate`, paylods);
  }



}

