import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessEventFilter, PagedResponseOfAccessEventDto } from '../models/access-event.model';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private url = `${environment.apiUrl}/access-events`;

  constructor(private http: HttpClient) { }

  listarEventos(filter: AccessEventFilter = {}): Observable<PagedResponseOfAccessEventDto> {
    let params = new HttpParams();

    if (filter.page != null) params = params.set('page', filter.page);
    if (filter.pageSize != null) params = params.set('pageSize', filter.pageSize);
    if (filter.personName) params = params.set('personName', filter.personName);
    if (filter.eventType != null) params = params.set('eventType', filter.eventType);
    if (filter.deviceName) params = params.set('deviceName', filter.deviceName);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);

    return this.http.get<PagedResponseOfAccessEventDto>(this.url, { params });
  }
}
