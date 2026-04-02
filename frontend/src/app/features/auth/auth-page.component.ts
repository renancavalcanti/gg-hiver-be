import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly mode = signal<'login' | 'register'>(
    (this.route.snapshot.data['mode'] as 'login' | 'register') ?? 'login',
  );
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    if (this.mode() === 'register') {
      this.form.controls.name.addValidators([Validators.required, Validators.minLength(2)]);
    }
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.mode() === 'register') {
      this.register();
      return;
    }

    this.login();
  }

  private register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .register({
        name: this.form.controls.name.getRawValue(),
        email: this.form.controls.email.getRawValue(),
        password: this.form.controls.password.getRawValue(),
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Could not complete registration.');
        },
      });
  }

  private login(): void {
    if (this.form.controls.email.invalid || this.form.controls.password.invalid) {
      this.form.controls.email.markAsTouched();
      this.form.controls.password.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .login({
        email: this.form.controls.email.getRawValue(),
        password: this.form.controls.password.getRawValue(),
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Could not sign in.');
        },
      });
  }
}
