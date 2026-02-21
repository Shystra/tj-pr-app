import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/translate/translation.service';
import { Theme, ThemeService } from '../../../core/theme/theme.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TranslateModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isDarkTheme: boolean = false;
  isMobile: boolean = false;
  isScrolled = false;
  private readonly MOBILE_WIDTH = 768;
  private readonly MAX_SCROLLY = 20;

  constructor(
    private translationService: TranslationService,
    private changesDetector: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    this.isDarkTheme = this.themeService['currentTheme'] === Theme.LIGHT;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > this.MAX_SCROLLY;
  }

  ngOnInit(): void {
    this.checkScreenWidth();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService['currentTheme'] === Theme.LIGHT;
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
