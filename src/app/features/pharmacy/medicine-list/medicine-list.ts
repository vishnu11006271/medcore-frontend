import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { PharmacyService } from '../services/pharmacy.service';

import {
  Medicine,
  MedicineStatusFilter
} from '../models/pharmacy.model';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.scss'
})
export class MedicineListComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly pharmacyService = inject(PharmacyService);

  readonly currentUser = this.authService.user;

  // Medicine data.
  readonly medicines = signal<Medicine[]>([]);

  // Loading and error states.
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  // Search and filter.
  readonly searchTerm = signal<string>('');
  readonly statusFilter = signal<MedicineStatusFilter>('ALL');

  // Pagination.
  readonly currentPage = signal<number>(1);
  readonly pageSize = 8;

  // Role-based permissions.
  readonly canManageMedicines = computed(() =>
    this.currentUser()?.role === 'HOSPITAL_ADMIN'
  );

  readonly canViewBatches = computed(() => {
    const role = this.currentUser()?.role;

    return role === 'HOSPITAL_ADMIN' ||
      role === 'PHARMACIST';
  });

  // Summary values.
  readonly totalMedicines = computed(() =>
    this.medicines().length
  );

  readonly activeMedicines = computed(() =>
    this.medicines().filter(medicine => medicine.isActive).length
  );

  readonly inactiveMedicines = computed(() =>
    this.medicines().filter(medicine => !medicine.isActive).length
  );

  readonly lowStockMedicines = computed(() =>
    this.medicines().filter(medicine =>
      medicine.isActive &&
      medicine.stockQuantity <= 10
    ).length
  );

  // Apply search and status filters.
  readonly filteredMedicines = computed(() => {

    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.medicines().filter(medicine => {

      const matchesSearch =
        !search ||
        medicine.name.toLowerCase().includes(search) ||
        (medicine.genericName ?? '').toLowerCase().includes(search) ||
        (medicine.strength ?? '').toLowerCase().includes(search) ||
        (medicine.manufacturer ?? '').toLowerCase().includes(search);

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && medicine.isActive) ||
        (status === 'INACTIVE' && !medicine.isActive);

      return matchesSearch && matchesStatus;
    });
  });

  // Calculate total pages.
  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(this.filteredMedicines().length / this.pageSize)
    )
  );

  // Display medicines on the current page.
  readonly paginatedMedicines = computed(() => {

    const startIndex =
      (this.currentPage() - 1) * this.pageSize;

    return this.filteredMedicines().slice(
      startIndex,
      startIndex + this.pageSize
    );
  });

  ngOnInit(): void {
    this.loadMedicines();
  }

  // Load medicines from the backend.
  // loadMedicines(): void {

  //   this.isLoading.set(true);
  //   this.errorMessage.set('');

  //   this.pharmacyService.getMedicines()
  //     .pipe(
  //       finalize(() => this.isLoading.set(false))
  //     )
  //     .subscribe({
  //       next: response => {

  //         this.medicines.set(response.data ?? []);
  //         this.currentPage.set(1);
  //       },
  //       error: error => {

  //         this.errorMessage.set(
  //           error?.error?.error?.message ??
  //           'Unable to load medicines.'
  //         );
  //       }
  //     });
  // }
  loadMedicines(): void {

  this.isLoading.set(true);
  this.errorMessage.set('');

  this.pharmacyService.getMedicines()
    .pipe(
      finalize(() => this.isLoading.set(false))
    )
    .subscribe({
      next: response => {

        this.medicines.set(response ?? []);
        this.currentPage.set(1);
      },
      error: error => {

        this.errorMessage.set(
          error?.error?.error?.message ??
          'Unable to load medicines.'
        );
      }
    });
}

  // Search medicines.
  onSearchChange(value: string): void {

    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  // Filter by medicine status.
  onStatusFilterChange(value: string): void {

    this.statusFilter.set(value as MedicineStatusFilter);
    this.currentPage.set(1);
  }

  // Check whether medicine stock is low.
  isLowStock(medicine: Medicine): boolean {

    return medicine.isActive &&
      medicine.stockQuantity <= 10;
  }

  // Pagination.
  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  // Format medicine price.
  formatPrice(price: number | string): number {

    return Number(price);
  }

  // Clear messages.
  clearMessages(): void {

    this.errorMessage.set('');
    this.successMessage.set('');
  }
}