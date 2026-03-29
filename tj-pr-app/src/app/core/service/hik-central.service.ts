import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HikPersonRequest } from '../models/hik-person.model';
import { HikOrganizationResponse } from '../models/hik-organization.model';
import { PrivilegeGroupFilter, PrivilegeGroupResponse } from '../models/hik-privilege-group.model';

@Injectable({
  providedIn: 'root'
})
export class HikCentralService {
  private url = `${environment.apiUrl}/hik-central`;

  constructor(private http: HttpClient) {}

  cadastrarPessoa(payload: HikPersonRequest): Observable<any> {
    return this.http.post(`${this.url}/persons`, payload);
  }

  listarOrganizacoes(pageNo: number, pageSize: number, orgName?: string): Observable<HikOrganizationResponse> {
    let params = new HttpParams()
      .set('pageNo', pageNo)
      .set('pageSize', pageSize);

    if (orgName) {
      params = params.set('orgName', orgName);
    }

    return this.http.get<HikOrganizationResponse>(`${this.url}/organizations`, { params });
  }

  listarGruposPrivilegio(filter: PrivilegeGroupFilter): Observable<PrivilegeGroupResponse> {
    const params = new HttpParams()
      .set('pageNo', filter.pageNo)
      .set('pageSize', filter.pageSize)
      .set('type', filter.type);

    return this.http.get<PrivilegeGroupResponse>(`${this.url}/privilege-groups`, { params });
  }
}
