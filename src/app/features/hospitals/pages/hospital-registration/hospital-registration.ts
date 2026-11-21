import { CommonModule } from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { HospitalRegistrationService } from '../../../../core/services/hospital-registration.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';


@Component({
  selector: 'app-hospital-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent
  ],
  templateUrl: './hospital-registration.html',
  styleUrl: './hospital-registration.scss'
})
export class HospitalRegistrationComponent {

  private readonly fb = inject(FormBuilder);

  private readonly router = inject(Router);

  private readonly registrationService =
    inject(HospitalRegistrationService);

  isLoading = false;

  errorMessage = '';

  successMessage = '';

  registrationForm = this.fb.nonNullable.group({

    hospitalName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]
    ],

    slug: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      ]
    ],

    hospitalEmail: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    registrationNumber: [
      ''
    ],

    hospitalPhone: [
      ''
    ],

    address: [
      '',
      [
        Validators.required
      ]
    ],

    adminFirstName: [
      '',
      [
        Validators.required
      ]
    ],

    adminLastName: [
      '',
      [
        Validators.required
      ]
    ],

    adminEmail: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    adminPhone: [
      ''
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(128)
      ]
    ]

  });

  get controls() {
    return this.registrationForm.controls;
  }

  getFieldError(control: AbstractControl): string {
    if (!control.touched || !control.invalid) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (control.hasError('minlength')) {
      return `Enter at least ${control.getError('minlength').requiredLength} characters.`;
    }

    if (control.hasError('maxlength')) {
      return `Use no more than ${control.getError('maxlength').requiredLength} characters.`;
    }

    if (control.hasError('pattern')) {
      return 'Use lowercase letters, numbers and single hyphens only.';
    }

    return 'Please check this value.';
  }

  /**
   * Generate a URL-friendly slug from the hospital name.
   */
  generateSlug(): void {

    const hospitalName =
      this.controls.hospitalName.value;

    const slug = hospitalName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    this.controls.slug.setValue(slug);
  }

  onSubmit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.registrationForm.invalid) {

      this.registrationForm.markAllAsTouched();

      return;
    }

    const formValue = this.registrationForm.getRawValue();

    const payload = {
      hospitalName: formValue.hospitalName.trim(),
      slug: formValue.slug.trim().toLowerCase(),
      hospitalEmail: formValue.hospitalEmail.trim().toLowerCase(),

      registrationNumber:
        formValue.registrationNumber.trim() || undefined,

      hospitalPhone:
        formValue.hospitalPhone.trim() || undefined,

      address: formValue.address.trim(),

      adminFirstName: formValue.adminFirstName.trim(),
      adminLastName: formValue.adminLastName.trim(),
      adminEmail: formValue.adminEmail.trim().toLowerCase(),

      adminPhone:
        formValue.adminPhone.trim() || undefined,

      password: formValue.password
    };

    this.isLoading = true;

    this.registrationService
      .registerHospital(payload)
      .subscribe({

        next: (response) => {

          this.isLoading = false;

          if (!response.success) {

            this.errorMessage =
              response.message || 'Registration failed.';

            return;
          }

          this.successMessage =
            'Hospital registration submitted successfully. Please verify the administrator email address.';

          this.router.navigate(
            ['/verify-email'],
            {
              queryParams: {
                email: payload.adminEmail,
                type: 'hospital'
              }
            }
          );

        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.error?.message ||
            error?.error?.message ||
            'Unable to register hospital. Please try again.';

        }

      });

  }

  goToLogin(): void {

    this.router.navigate(['/login']);

  }

}