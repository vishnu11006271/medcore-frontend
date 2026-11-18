import {
  Component,
  computed,
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

import {
  Hospital,
  CreateHospitalRequest
} from '../../../../core/models/hospital.model';


type HospitalStatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

type HospitalAction = 'VERIFY' | 'REJECT';


@Component({
  selector: 'app-hospitals-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './hospitals-list.html',
  styleUrl: './hospitals-list.scss'
})
export class HospitalsList implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly hospitalService = inject(HospitalService);

  // --------------------------------------------------
  // Signals
  // --------------------------------------------------

  readonly hospitals = signal<Hospital[]>([]);

  readonly loading = signal(false);
  readonly submitting = signal(false);

  readonly showForm = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  // --------------------------------------------------
  // Status filter and summary counts
  // --------------------------------------------------

  readonly statusFilter = signal<HospitalStatusFilter>('ALL');

  readonly filteredHospitals = computed(() => {
    const filter = this.statusFilter();
    const allHospitals = this.hospitals();

    if (filter === 'ALL') {
      return allHospitals;
    }

    return allHospitals.filter(
      hospital => hospital.status === filter
    );
  });

  readonly pendingCount = computed(() =>
    this.hospitals().filter(
      hospital => hospital.status === 'PENDING'
    ).length
  );

  readonly verifiedCount = computed(() =>
    this.hospitals().filter(
      hospital => hospital.status === 'VERIFIED'
    ).length
  );

  readonly rejectedCount = computed(() =>
    this.hospitals().filter(
      hospital => hospital.status === 'REJECTED'
    ).length
  );

  // --------------------------------------------------
  // Hospital action confirmation
  // --------------------------------------------------

  readonly pendingAction = signal<{
    hospital: Hospital;
    action: HospitalAction;
  } | null>(null);

  readonly processingAction = signal(false);
  readonly actionError = signal<string | null>(null);

  // --------------------------------------------------
  // Hospital form
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngOnInit(): void {
    this.loadHospitals();
  }

  // --------------------------------------------------
  // Load hospitals
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Status filter
  // --------------------------------------------------

  setStatusFilter(filter: HospitalStatusFilter): void {
    this.statusFilter.set(filter);
  }

  // --------------------------------------------------
  // Hospital form methods
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Create hospital
  // --------------------------------------------------

  createHospital(): void {
    if (this.hospitalForm.invalid || this.submitting()) {
      this.hospitalForm.markAllAsTouched();
      return;
    }

    const formValue = this.hospitalForm.getRawValue();

    const payload: CreateHospitalRequest = {
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

  // --------------------------------------------------
  // Request verify/reject confirmation
  // --------------------------------------------------

  requestHospitalAction(
    hospital: Hospital,
    action: HospitalAction
  ): void {

    // Only pending hospitals can be approved or rejected.
    if (hospital.status !== 'PENDING') {
      return;
    }

    this.actionError.set(null);

    this.pendingAction.set({
      hospital,
      action
    });
  }

  // --------------------------------------------------
  // Cancel confirmation
  // --------------------------------------------------

  cancelHospitalAction(): void {
    if (this.processingAction()) {
      return;
    }

    this.pendingAction.set(null);
    this.actionError.set(null);
  }

  // --------------------------------------------------
  // Confirm verify/reject action
  // --------------------------------------------------

  confirmHospitalAction(): void {

    const pending = this.pendingAction();

    if (!pending || this.processingAction()) {
      return;
    }

    const hospital = pending.hospital;
    const action = pending.action;

    this.processingAction.set(true);
    this.actionError.set(null);
    this.successMessage.set(null);

    // Select API based on the requested action.
    const request$ = action === 'VERIFY'
      ? this.hospitalService.verifyHospital(hospital.id)
      : this.hospitalService.rejectHospital(hospital.id);

    request$
      .pipe(
        finalize(() => this.processingAction.set(false))
      )
      .subscribe({
        next: response => {

          // Update the changed hospital in the list.
          this.hospitals.update(items =>
            items.map(item =>
              item.id === response.data.id
                ? {
                    ...item,
                    ...response.data
                  }
                : item
            )
          );

          this.successMessage.set(response.message);

          // Close confirmation dialog.
          this.pendingAction.set(null);
        },

        error: error => {
          this.actionError.set(
            error?.error?.error?.message ||
            `Unable to ${action.toLowerCase()} hospital. Please try again.`
          );
        }
      });
  }
}