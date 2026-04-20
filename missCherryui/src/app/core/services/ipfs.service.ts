import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface UploadMetadataPayload {
  description?: string;
  ingredients?: string[];
  dosageForm?: string;
  storageInstructions?: string;
  manufacturerLicense?: string;
  countryOfOrigin?: string;
  additionalInfo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IpfsService {
    private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  uploadMetadata(metadata: UploadMetadataPayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/ipfs/upload-metadata`, metadata, {
      responseType: 'text',
    });
  }

}
