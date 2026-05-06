import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../../core/service/auth/auth.service';
import { TranslationService } from '../../../shared/translate/translation.service';
import { TokenMethodsUtils } from '../../../util/token-methods';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  currentYear: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private translationService: TranslationService,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [TokenMethodsUtils.isRememberMe()],
    });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleLanguage(): void {
    const currentLanguage = this.translationService.getSelectedLanguage();
    const nextLanguage = currentLanguage === 'pt-BR' ? 'en-US' : 'pt-BR';
    this.translationService.setLanguage(nextLanguage);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.getRawValue();
    this.loading = true;

    this.authService.login({ email, password, rememberMe }).subscribe({
      next: () => {
        this.loading = false;

        this.snackBar.open(
          this.translationService.getTranslation('LOGIN.SUCCESS'),
          this.translationService.getTranslation('LOGIN.CLOSE'),
          { duration: 3000, panelClass: 'snack-success' },
        );

        this.router.navigateByUrl(this.getReturnUrl());
      },
      error: (httpError: HttpErrorResponse) => {
        this.loading = false;

        const messageKey = httpError.status === HttpStatusCode.Unauthorized ? 'LOGIN.ERROR_MESSAGE_LOGIN' : 'LOGIN.SERVER_ERROR';

        this.snackBar.open(
          this.translationService.getTranslation(messageKey),
          this.translationService.getTranslation('LOGIN.CLOSE'),
          { duration: 4000, panelClass: 'snack-error' },
        );
      },
    });
  }

  private getReturnUrl(): string {
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

    return returnUrl?.startsWith('/') ? returnUrl : '/home';
  }
}
