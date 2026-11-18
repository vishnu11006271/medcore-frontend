import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoading = false;
  isResending = false;

  errorMessage = '';
  successMessage = '';
  resendMessage = '';

  resendCountdown = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;

  isHospitalRegistration = false;

  verifyForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    otp: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]
    ]
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {

      const email = params.get('email');

      if (email) {
        this.email.setValue(email);
      }

      this.isHospitalRegistration =
        params.get('type') === 'hospital';

    });
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  get email() {
    return this.verifyForm.controls.email;
  }

  get otp() {
    return this.verifyForm.controls.otp;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.resendMessage = '';

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.verifyEmail(
      this.verifyForm.getRawValue()
    ).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
            this.successMessage = this.isHospitalRegistration
            ? 'Email verified successfully. Your hospital registration is now awaiting Super Admin approval.'
            : 'Your email has been verified successfully.';

            this.clearCountdown();

            setTimeout(() => {
            this.router.navigate(['/login']);
            }, 2000);
        } else {
            this.errorMessage =
            response.message || 'Email verification failed.';
        }
        },
      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Email verification failed. Please check your OTP.';
      }
    });
  }

  resendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.resendMessage = '';

    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }

    if (
    this.resendCountdown > 0 ||
    this.isResending ||
    this.isLoading
    ) {
    return;
    }

    this.isResending = true;

    this.authService.resendVerificationOtp({
      email: this.email.value.trim().toLowerCase()
    }).subscribe({
      next: (response) => {
        this.isResending = false;

        if (response.success) {
          this.otp.reset();

          this.resendMessage =
            'If your account can be verified, a new OTP email will be sent.';

          this.startCountdown();
        }
      },
      error: (error) => {
        this.isResending = false;

        this.errorMessage =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Unable to process your request. Please try again later.';
      }
    });
  }

  private startCountdown(): void {
    this.clearCountdown();

    this.resendCountdown = 60;

    this.countdownInterval = setInterval(() => {
      if (this.resendCountdown > 0) {
        this.resendCountdown--;
      } else {
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }

    this.resendCountdown = 0;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}