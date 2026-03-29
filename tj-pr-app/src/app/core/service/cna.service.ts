import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdvogadoCnaResponse } from '../models/cna.model';

@Injectable({
  providedIn: 'root'
})
export class CnaService {
  private url = `${environment.apiUrl}/advogados`;

  constructor(private http: HttpClient) { }

  consultarAdvogado(uf: string, oab: string): Observable<AdvogadoCnaResponse> {
    return this.http.get<AdvogadoCnaResponse>(`${this.url}/${uf}/${oab}`);
  }
}
