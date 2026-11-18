import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PharmacyService } from '../services/pharmacy.service';
import { Medicine, ReceiveStockRequest } from '../models/pharmacy.model';

@Component({
  selector: 'app-receive-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './receive-stock.html',
  styleUrl: './receive-stock.scss'
})
export class ReceiveStockComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pharmacyService = inject(PharmacyService);

  readonly medicines = signal<Medicine[]>([]);
  readonly selectedMedicine = signal<Medicine | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly stockForm = this.fb.nonNullable.group({
    medicineId: ['', Validators.required],
    batchNumber: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    expiryDate: ['', Validators.required],
    quantityReceived: [1, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[1-9]\d*$/)
    ]],
    purchasePrice: [0, [
      Validators.min(0),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]]
  });

  readonly today = new Date().toISOString().slice(0, 10);

  get f() {
    return this.stockForm.controls;
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading.set(true);

    this.pharmacyService.getMedicines()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: medicines => {
          this.medicines.set(
            medicines.filter(medicine => medicine.isActive)
          );

          const medicineId =
            this.route.snapshot.paramMap.get('medicineId');

          if (medicineId) {
            const medicine = this.medicines().find(
              item => item.id === medicineId
            );

            if (medicine) {
              this.stockForm.controls.medicineId.setValue(medicine.id);
              this.selectedMedicine.set(medicine);
            } else {
              this.errorMessage.set(
                'Selected medicine was not found or is inactive.'
              );
            }
          }
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.message ??
            'Unable to load medicines.'
          );
        }
      });
  }

  onMedicineChange(medicineId: string): void {
    const medicine = this.medicines().find(
      item => item.id === medicineId
    );

    this.selectedMedicine.set(medicine ?? null);
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const value = this.stockForm.getRawValue();

    const payload: ReceiveStockRequest = {
      medicineId: value.medicineId,
      batchNumber: value.batchNumber.trim(),
      expiryDate: value.expiryDate,
      quantityReceived: Number(value.quantityReceived),
      purchasePrice: Number(value.purchasePrice)
    };

    this.isSaving.set(true);

    this.pharmacyService.receiveStock(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Stock received successfully.');

          this.router.navigate([
            '/dashboard/pharmacy/medicines',
            value.medicineId,
            'batches'
          ]);
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.message ??
            error?.error?.error?.message ??
            'Unable to receive stock.'
          );
        }
      });
  }
}