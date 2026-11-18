import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PharmacyService } from '../services/pharmacy.service';

import {
  CreateMedicineRequest,
  Medicine,
  UpdateMedicineRequest
} from '../models/pharmacy.model';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './medicine-form.html',
  styleUrl: './medicine-form.scss'
})
export class MedicineFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly pharmacyService = inject(PharmacyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly medicineId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.medicineId());

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly medicineForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(150)
    ]],
    genericName: ['', [
      Validators.maxLength(150)
    ]],
    strength: ['', [
      Validators.maxLength(50)
    ]],
    manufacturer: ['', [
      Validators.maxLength(150)
    ]],
    unitPrice: [0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]]
  });

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.medicineId.set(id);
      this.loadMedicine(id);
    }
  }

  get f() {
    return this.medicineForm.controls;
  }

  loadMedicine(id: string): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.pharmacyService.getMedicines()
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: medicines => {

          const medicine = medicines.find(item => item.id === id);

          if (!medicine) {
            this.errorMessage.set('Medicine not found.');
            return;
          }

          this.patchForm(medicine);
        },
        error: error => {

          this.errorMessage.set(
            error?.error?.message ??
            'Unable to load medicine details.'
          );
        }
      });
  }

  patchForm(medicine: Medicine): void {

    this.medicineForm.patchValue({
      name: medicine.name,
      genericName: medicine.genericName ?? '',
      strength: medicine.strength ?? '',
      manufacturer: medicine.manufacturer ?? '',
      unitPrice: Number(medicine.unitPrice)
    });
  }

  submit(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.medicineForm.invalid) {
      this.medicineForm.markAllAsTouched();
      return;
    }

    const formValue = this.medicineForm.getRawValue();

    const payload: CreateMedicineRequest = {
      name: formValue.name.trim(),
      genericName: formValue.genericName.trim(),
      strength: formValue.strength.trim(),
      manufacturer: formValue.manufacturer.trim(),
      unitPrice: Number(formValue.unitPrice)
    };

    this.isSaving.set(true);

    if (this.isEditMode()) {

      const updatePayload: UpdateMedicineRequest = payload;

      this.pharmacyService.updateMedicine(
        this.medicineId()!,
        updatePayload
      )
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/pharmacy/medicines']);
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.message ??
            'Unable to update medicine.'
          );
        }
      });

    } else {

      this.pharmacyService.createMedicine(payload)
        .pipe(
          finalize(() => this.isSaving.set(false))
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard/pharmacy/medicines']);
          },
          error: error => {
            this.errorMessage.set(
              error?.error?.message ??
              'Unable to create medicine.'
            );
          }
        });
    }
  }
}