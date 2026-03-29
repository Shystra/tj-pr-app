import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AccessControlService } from '../../core/service/access-control.service';
import { AccessEventDto, AccessEventFilter, AccessEventType, AccessResultType, AuthenticationMethodType } from '../../core/models/access-event.model';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss',
})
export class MonitoringComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  activities: AccessEventDto[] = [];
  searchTerm = '';
  isLoading = false;
  totalHoje = 0;
  totalAtivos = 0;
  totalEventos = 0;
  totalNegados = 0;
  totalBiometria = 0;

  pageIndex = 0;
  pageSize = 20;

  readonly AccessEventType = AccessEventType;
  readonly AccessResultType = AccessResultType;

  constructor(private accessControlService: AccessControlService) { }

  ngOnInit() {
    this.carregarEventos();
    this.ouvirBusca();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: PageEvent) => {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.carregarEventos();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildFilter(): AccessEventFilter {
    const hoje = new Date();
    const inicioDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString();

    return {
      page: this.pageIndex + 1, // backend é 1-based
      pageSize: this.pageSize,
      startDate: inicioDia,
      personName: this.searchTerm || undefined
    };
  }

  carregarEventos() {
    this.isLoading = true;

    this.accessControlService.listarEventos(this.buildFilter())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.activities = res.items;
          this.totalEventos = res.total;
          this.totalHoje = res.total;
          this.totalAtivos = res.items.filter(
            e => e.eventType === AccessEventType.Entry &&
              e.accessResult === AccessResultType.Success
          ).length;
          this.totalNegados = res.items.filter(
            e => e.accessResult === AccessResultType.Denied
          ).length;
          this.totalBiometria = res.items.filter(
            e => e.authenticationMethod === AuthenticationMethodType.Face
          ).length;

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  ouvirBusca() {
    this.searchSubject$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.carregarEventos();
      });
  }

  buscar(term: string) {
    this.searchTerm = term;
    this.searchSubject$.next(term);
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
