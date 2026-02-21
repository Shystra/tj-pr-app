import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export interface Locale {
    lang: string;
    data: Record<string, any>;
}

const LOCALIZATION_LOCAL_STORAGE_KEY = 'language';
const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'pt-PT'];

@Injectable({
    providedIn: 'root',
})
export class TranslationService {

    private languageChangeSubject!: BehaviorSubject<string>;
    languageChange$ = this.languageChangeSubject?.asObservable();

    constructor(private translate: TranslateService) {
        const selectedLang = this.getSelectedLanguage();

        this.languageChangeSubject = new BehaviorSubject<string>(selectedLang);
        this.languageChange$ = this.languageChangeSubject.asObservable();

        this.initLanguages();
    }

    private initLanguages(): void {
        this.translate.addLangs(SUPPORTED_LANGUAGES);
        const defaultLang = this.getSelectedLanguage();
        this.translate.setDefaultLang(defaultLang);
        this.translate.use(defaultLang);
    }

    loadTranslations(...locales: Locale[]): void {
        locales.forEach(locale => {
            this.translate.setTranslation(locale.lang, locale.data, true);
        });
    }

    setLanguage(lang: string): void {
        if (SUPPORTED_LANGUAGES.includes(lang)) {
            this.translate.use(lang);
            localStorage.setItem(LOCALIZATION_LOCAL_STORAGE_KEY, lang);

            this.languageChangeSubject.next(lang);
        }
    }

    getSelectedLanguage(): string {
        return (
            localStorage.getItem(LOCALIZATION_LOCAL_STORAGE_KEY) ||
            this.translate.getBrowserLang() ||
            this.translate.getDefaultLang()
        );
    }

    getTranslation(key: string): string {
        return this.translate.instant(key);
    }
}
