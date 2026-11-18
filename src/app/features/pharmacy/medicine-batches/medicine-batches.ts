import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PharmacyService } from '../services/pharmacy.service';
import {
  Medicine,
  MedicineBatch
} from '../models/pharmacy.model';

@Component({
  selector: 'app-medicine-batches',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './medicine-batches.html',
  styleUrl: './medicine-batches.scss'
})
export class MedicineBatchesComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly pharmacyService = inject(PharmacyService);

  readonly medicineId = signal('');
  readonly medicine = signal<Medicine | null>(null);
  readonly batches = signal<MedicineBatch[]>([]);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly totalReceived = computed(() =>
    this.batches().reduce(
      (total, batch) => total + batch.quantityReceived,
      0
    )
  );

  readonly availableStock = computed(() =>
    this.batches().reduce(
      (total, batch) => total + batch.quantityAvailable,
      0
    )
  );

  readonly expiredBatches = computed(() => {
    const today = new Date();

    return this.batches().filter(batch =>
      new Date(batch.expiryDate) < today
    ).length;
  });

  readonly toNumber = (value: number | string): number => Number(value);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Medicine ID is missing.');
      return;
    }

    this.medicineId.set(id);
    this.loadData(id);
  }

  loadData(id: string): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.pharmacyService.getMedicines()
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: medicines => {
          const selectedMedicine = medicines.find(item => item.id === id);

          if (!selectedMedicine) {
            this.errorMessage.set('Medicine not found.');
            return;
          }

          this.medicine.set(selectedMedicine);
          this.loadBatches(id);
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.message ??
            'Unable to load medicine details.'
          );
        }
      });
  }

  loadBatches(id: string): void {

    this.pharmacyService.getMedicineBatches(id).subscribe({
      next: batches => {
        this.batches.set(batches ?? []);
      },
      error: error => {
        this.errorMessage.set(
          error?.error?.message ??
          'Unable to load medicine batches.'
        );
      }
    });
  }

  isExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  isExpiringSoon(expiryDate: string): boolean {

    const today = new Date();
    const expiry = new Date(expiryDate);

    const days =
      (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);

    return days >= 0 && days <= 90;
  }
}