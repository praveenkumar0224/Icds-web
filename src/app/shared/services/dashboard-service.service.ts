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

  xenovexUrl =  "https://icds.xenovex.com/awcmonitor/home?user_id=OdRwtt9rSR0rMc3aLLgYCMSTN6ksGFVY3x%2B9SluU0NY%3D" 
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

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
    if(districtId && blockId ){
      params.push(`block_id=${blockId}`);
    } if(districtId){
      params.push(`district_id=${districtId}`);
}

  
    const queryString = params.length ? '?' + params.join('&') : '';

    
    let url: string;

    if (districtId && blockId ) {
      url = `${this.baseUrl}web-dashboard/block${queryString}`;
    }else if (districtId ) {
      url = `${this.baseUrl}web-dashboard/district${queryString}`;
    } else{
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

  
    return this.http.get(url, { headers });
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
   // console.log(token, 'token');
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
    //console.log(token, 'token');
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
    //console.log(token, 'token');
    const paylods = {
      filter: {"sector_id":blockId}
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // The second argument is the body (empty object here), third is the options
    return this.http.post(`${this.baseUrl}sector/paginate`, paylods, { headers });
  }


 
}

