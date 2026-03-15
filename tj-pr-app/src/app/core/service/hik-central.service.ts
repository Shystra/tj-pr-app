import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HikPersonRequest } from '../models/hik-person.model';
import { HikOrganizationResponse } from '../models/hik-organization.model';

@Injectable({
  providedIn: 'root'
})
export class HikCentralService {
  private url = `${environment.apiUrl}/hik-central`;
  constructor(
    private http: HttpClient
  ) { }

  cadastrarPessoa(payload: HikPersonRequest): Observable<any> {
    return this.http.post(`${this.url}/persons`, payload);
  }

  listarOrganizacoes(pageNo: number, pageSize: number, orgName?: string): Observable<HikOrganizationResponse> {
    let params = new HttpParams().set('pageNo', pageNo).set('pageSize', pageSize);

    if (orgName) {
      params = params.set('orgName', orgName);
    }

    return this.http.get<HikOrganizationResponse>(`${this.url}/organizations`, { params });
  }
}
