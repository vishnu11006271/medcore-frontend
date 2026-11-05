
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { finalize } from 'rxjs';

import { HospitalService } from '../../../../core/services/hospital.service';
import { Hospital } from '../../../../core/models/hospital.model';

@Component({
  selector: 'app-hospitals-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hospitals-list.html',
  styleUrl: './hospitals-list.scss'
})
export class HospitalsList implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly hospitalService = inject(HospitalService);

  readonly hospitals = signal<Hospital[]>([]);

  readonly loading = signal(false);
  readonly submitting = signal(false);

  readonly showForm = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  readonly pendingVerification = signal<Hospital | null>(null);
  readonly verifying = signal(false);
  readonly verificationError = signal<string | null>(null);

  readonly hospitalForm = this.formBuilder.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],
    slug: ['', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254)
    ]],
    registrationNumber: ['', [
      Validators.maxLength(50)
    ]],
    phone: ['', [
      Validators.maxLength(30)
    ]],
    address: ['', [
      Validators.maxLength(500)
    ]]
  });

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.hospitalService.getHospitals()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.hospitals.set(response.data);
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.error?.message ||
            'Unable to load hospitals. Please try again.'
          );
        }
      });
  }

  onHospitalNameChange(): void {
    const name = this.hospitalForm.controls.name.value;

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.hospitalForm.controls.slug.setValue(slug);
  }

  openCreateForm(): void {
    this.hospitalForm.reset({
      name: '',
      slug: '',
      email: '',
      registrationNumber: '',
      phone: '',
      address: ''
    });

    this.formError.set(null);
    this.successMessage.set(null);
    this.showForm.set(true);
  }

  closeCreateForm(): void {
    if (this.submitting()) {
      return;
    }

    this.showForm.set(false);
    this.formError.set(null);
  }

  createHospital(): void {
    if (this.hospitalForm.invalid || this.submitting()) {
      this.hospitalForm.markAllAsTouched();
      return;
    }

    const formValue = this.hospitalForm.getRawValue();

    const payload = {
      name: formValue.name.trim(),
      slug: formValue.slug.trim(),
      email: formValue.email.trim(),
      ...(formValue.registrationNumber.trim() && {
        registrationNumber: formValue.registrationNumber.trim()
      }),
      ...(formValue.phone.trim() && {
        phone: formValue.phone.trim()
      }),
      ...(formValue.address.trim() && {
        address: formValue.address.trim()
      })
    };

    this.submitting.set(true);
    this.formError.set(null);
    this.successMessage.set(null);

    this.hospitalService.createHospital(payload)
      .pipe(
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: response => {
          this.hospitals.update(items => [
            response.data,
            ...items
          ]);

          this.successMessage.set(response.message);
          this.showForm.set(false);

          this.hospitalForm.reset({
            name: '',
            slug: '',
            email: '',
            registrationNumber: '',
            phone: '',
            address: ''
          });
        },
        error: error => {
          this.formError.set(
            error?.error?.error?.message ||
            'Unable to create hospital. Please try again.'
          );
        }
      });
  }

  requestVerification(hospital: Hospital): void {
    this.verificationError.set(null);
    this.pendingVerification.set(hospital);
  }

  cancelVerification(): void {
    if (this.verifying()) {
      return;
    }

    this.pendingVerification.set(null);
    this.verificationError.set(null);
  }

  confirmVerification(): void {
    const hospital = this.pendingVerification();

    if (!hospital || this.verifying()) {
      return;
    }

    this.verifying.set(true);
    this.verificationError.set(null);

    this.hospitalService.verifyHospital(hospital.id)
      .pipe(
        finalize(() => this.verifying.set(false))
      )
      .subscribe({
        next: response => {
          this.hospitals.update(items =>
            items.map(item =>
              item.id === response.data.id
                ? { ...item, ...response.data }
                : item
            )
          );

          this.successMessage.set(response.message);
          this.pendingVerification.set(null);
        },
        error: error => {
          this.verificationError.set(
            error?.error?.error?.message ||
            'Unable to verify hospital. Please try again.'
          );
        }
      });
  }
}
