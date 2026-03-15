import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Advogado } from '../models/advogado.model';

@Injectable({
  providedIn: 'root'
})
export class AdvogadoService {

  private url = `${environment.apiUrl}/advogados`;

  constructor(
    private http: HttpClient
  ) { }

  consultarAdvogado(uf: string, oab: string): Observable<Advogado> {
    return this.http.get<Advogado>(`${this.url}/${uf}/${oab}`);
  }
}
