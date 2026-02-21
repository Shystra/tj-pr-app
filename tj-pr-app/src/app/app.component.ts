import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from './shared/translate/translation.service';
import { ptBR as brLang } from './shared/translate/vocabs/pt-BR';
import { ptPT as ptLang } from './shared/translate/vocabs/pt-PT';
import { enUS as usLang } from './shared/translate/vocabs/en-US';
import { esES as esLang } from './shared/translate/vocabs/es-ES';
import { CommonModule } from '@angular/common';
import { STRING_DASH, STRING_EMPTY } from './shared/constants/string-consts';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { HeaderComponent } from './layout/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
<router-outlet></router-outlet>
  `,
  styleUrl: './app.component.scss',
  imports: [RouterModule, RouterOutlet, TranslateModule, HeaderComponent, CommonModule],
})
export class AppComponent implements OnInit {

  private readonly languages = [brLang, ptLang, usLang, esLang];

  constructor(
    private translationService: TranslationService,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.translationService.loadTranslations(...this.languages);

    const storedLanguage = localStorage.getItem('language');
    const initialLanguage = storedLanguage ? storedLanguage : this.identifyLanguage(navigator.language);

    this.translationService.setLanguage(initialLanguage);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => this.updateTitle());
  }

  private updateTitle(): void {
    const titleKey = this.activatedRoute.firstChild?.snapshot.data?.['title'];
    if (titleKey) {
      this.titleService.setTitle(
        `Iris - ${this.translationService.getTranslation(titleKey)}`
      );
    }
  }

  private identifyLanguage(language: string): string {
    const exactMatch = this.languages.find(
      lang => lang.lang === language
    )?.lang;

    if (exactMatch)
      return exactMatch;

    const partialMatch = this.languages.find(
      lang => lang.lang.split(STRING_DASH)[0] === language.split(STRING_DASH)[0]
    )?.lang;

    return partialMatch || 'pt-BR';
  }
}
