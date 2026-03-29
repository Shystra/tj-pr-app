import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AccessControlService } from '../../core/service/access-control.service';
import { AccessEventDto, AccessEventType, AccessResultType } from '../../core/models/access-event.model';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss',
})
export class MonitoringComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  activities: AccessEventDto[] = [];
  searchTerm = '';
  isLoading = false;
  totalHoje = 0;
  totalAtivos = 0;

  readonly AccessEventType = AccessEventType;
  readonly AccessResultType = AccessResultType;

  constructor(private accessControlService: AccessControlService) { }

  ngOnInit() {
    this.carregarEventos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarEventos() {
    this.isLoading = true;
    const hoje = new Date();
    const inicioDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString();

    this.accessControlService.listarEventos({
      page: 1,
      pageSize: 20,
      startDate: inicioDia
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.activities = res.items;
          this.totalHoje = res.total;
          this.totalAtivos = res.items.filter(
            e => e.eventType === AccessEventType.Entry && e.accessResult === AccessResultType.Success
          ).length;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  buscar(term: string) {
    this.searchTerm = term;
    this.isLoading = true;
    this.accessControlService.listarEventos({
      page: 1,
      pageSize: 20,
      personName: term || undefined
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.activities = res.items;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getEventLabel(type: AccessEventType): string {
    const labels: Record<number, string> = {
      [AccessEventType.Entry]: 'Entrada',
      [AccessEventType.Exit]: 'Saída',
      [AccessEventType.Denied]: 'Negado'
    };
    return labels[type] ?? 'Desconhecido';
  }

  getEventClass(type: AccessEventType): string {
    const classes: Record<number, string> = {
      [AccessEventType.Entry]: 'bg-success',
      [AccessEventType.Exit]: 'bg-danger',
      [AccessEventType.Denied]: 'bg-warning text-dark'
    };
    return classes[type] ?? 'bg-secondary';
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `${diffMin} min atrás`;
    const diffH = Math.floor(diffMin / 60);
    return `${diffH}h atrás`;
  }
}
