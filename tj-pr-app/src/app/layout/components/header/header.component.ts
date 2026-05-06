import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/translate/translation.service';
import { Theme, ThemeService } from '../../../core/theme/theme.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AccessControlService } from '../../../core/service/access-control.service';
import { AccessEventType, AccessResultType } from '../../../core/models/access-event.model';
import { AuthService } from '../../../core/service/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TranslateModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  isDarkTheme: boolean = false;
  isMobile: boolean = false;
  isScrolled = false;

  acessosAtivos = 0;
  acessosHoje = 0;
  isLoadingStats = false;

  private readonly MOBILE_WIDTH = 768;
  private readonly MAX_SCROLLY = 20;
  private destroy$ = new Subject<void>();

  constructor(
    private translationService: TranslationService,
    private changesDetector: ChangeDetectorRef,
    private themeService: ThemeService,
    private accessControlService: AccessControlService,
    private authService: AuthService
  ) {
    this.isDarkTheme = this.themeService['currentTheme'] === Theme.LIGHT;
  }

  ngOnInit(): void {
    this.checkScreenWidth();
    this.carregarEstatisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarEstatisticas(): void {
    this.isLoadingStats = true;
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    this.accessControlService.listarEventos({
      page: 1,
      pageSize: 100,
      startDate: inicioDia.toISOString()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.acessosHoje = res.total;
        this.acessosAtivos = res.items.filter(
          e =>
            e.eventType === AccessEventType.Entry &&
            e.accessResult === AccessResultType.Success
        ).length;
        this.isLoadingStats = false;
      },
      error: () => {
        this.isLoadingStats = false;
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > this.MAX_SCROLLY;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService['currentTheme'] === Theme.LIGHT;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleLanguageHeader(language: string): void {
    this.translationService.setLanguage(language);
    this.changesDetector.detectChanges();
  }

  checkScreenWidth(): void {
    this.isMobile = window.innerWidth <= this.MOBILE_WIDTH;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenWidth();
  }
}
