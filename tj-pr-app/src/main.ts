import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgxMask } from 'ngx-mask';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, TranslateModule.forRoot()),
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
    provideAnimationsAsync(),
    provideNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ]
}).catch(err => console.error(err));
