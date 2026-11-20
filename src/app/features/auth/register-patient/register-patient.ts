import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-patient.html',
  styleUrl: './register-patient.scss'
})
export class RegisterPatientComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = false;
  errorMessage = '';

  readonly registrationForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]]
  });

  get controls() {
    return this.registrationForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const value = this.registrationForm.getRawValue();
    this.isLoading = true;

    this.authService.register({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim().toLowerCase(),
      password: value.password,
      role: 'PATIENT'
    }).subscribe({
      next: response => {
        this.isLoading = false;
        if (!response.success) {
          this.errorMessage = response.message || 'Registration failed.';
          return;
        }
        this.router.navigate(['/verify-email'], {
          queryParams: { email: value.email.trim().toLowerCase(), type: 'patient' }
        });
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error?.message
          || error?.error?.message
          || 'Unable to create your account. Please try again.';
      }
    });
  }
}
