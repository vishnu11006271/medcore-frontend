import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { PharmacyService } from '../services/pharmacy.service';
import { ActivePrescription } from '../models/active-prescription.model';
import { DispensePrescriptionRequest } from '../models/dispense-prescription.model';

@Component({
  selector: 'app-prescription-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-queue.html',
  styleUrl: './prescription-queue.scss'
})
export class PrescriptionQueueComponent implements OnInit {

  private readonly pharmacyService = inject(PharmacyService);

  // Writable signals
  readonly prescriptions = signal<ActivePrescription[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly dispensingItemIds = signal<string[]>([]);
  readonly successMessage = signal('');
  readonly dispenseNotes = signal('');
  readonly dispenseQuantities = signal<Record<string, number>>({});

  ngOnInit(): void {
    this.loadActivePrescriptions();
  }

  loadActivePrescriptions(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.pharmacyService.getActivePrescriptions()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.prescriptions.set(response?.data ?? []);
        },

        error: (error) => {
          this.errorMessage.set(
            error?.error?.error?.message ||
            error?.error?.message ||
            'Unable to load active prescriptions. Please try again.'
          );
        }
      });
  }

  getRemainingItemCount(prescription: ActivePrescription): number {
    return prescription.items.filter(
      item => item.remainingQuantity > 0
    ).length;
  }

  getTotalRemainingItems(prescription: ActivePrescription): number {
    return prescription.items.reduce(
      (total, item) => total + item.remainingQuantity,
      0
    );
  }

  getDispenseQuantity(itemId: string, remainingQuantity: number): number {
    const quantities = this.dispenseQuantities();

    return quantities[itemId] ?? remainingQuantity;
  }

  updateDispenseQuantity(itemId: string, value: string): void {
    const quantity = Number(value);

    this.dispenseQuantities.update(current => ({
      ...current,
      [itemId]: quantity
    }));
  }

  dispenseMedicine(
    prescription: ActivePrescription,
    itemId: string,
    remainingQuantity: number
  ): void {
    const quantity = this.getDispenseQuantity(itemId, remainingQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      this.errorMessage.set('Enter a valid dispensing quantity.');
      return;
    }

    if (quantity > remainingQuantity) {
      this.errorMessage.set(
        `You can dispense at most ${remainingQuantity} units.`
      );
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.dispensingItemIds.update(ids => [...ids, itemId]);

    const payload: DispensePrescriptionRequest = {
      prescriptionId: prescription.id,
      items: [
        {
          prescriptionItemId: itemId,
          quantity
        }
      ],
      notes: this.dispenseNotes().trim() || undefined
    };

    this.pharmacyService.dispensePrescription(payload)
      .pipe(
        finalize(() => {
          this.dispensingItemIds.update(
            ids => ids.filter(id => id !== itemId)
          );
        })
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            `${quantity} unit(s) dispensed successfully.`
          );

          this.dispenseQuantities.update(current => {
            const updated = { ...current };
            delete updated[itemId];
            return updated;
          });

          this.loadActivePrescriptions();
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.error?.message ||
            error?.error?.message ||
            'Unable to dispense medicine. Please check stock and try again.'
          );
        }
      });
  }
}