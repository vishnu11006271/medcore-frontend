import {
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LaboratoryService } from '../../../../core/services/laboratory.service';

import {
  LaboratoryOrder,
  LabOrderStatus,
  UploadLabResult
} from '../../../../core/models/laboratory.model';

type OrderFilter = 'ALL' | LabOrderStatus;

@Component({
  selector: 'app-laboratory-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboratory-orders.html',
  styleUrl: './laboratory-orders.scss'
})
export class LaboratoryOrdersComponent implements OnInit {

  private readonly laboratoryService = inject(LaboratoryService);

  readonly orders = signal<LaboratoryOrder[]>([]);

  readonly selectedOrder = signal<LaboratoryOrder | null>(null);

  readonly loading = signal(false);
  readonly actionLoading = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly selectedFilter = signal<OrderFilter>('ALL');

  readonly showResultForm = signal(false);

  readonly resultText = signal('');
  readonly resultFileUrl = signal('');
  readonly formError = signal('');

  readonly totalOrders = computed(() => this.orders().length);

  readonly orderedCount = computed(
    () => this.orders().filter(o => o.status === 'ORDERED').length
  );

  readonly collectedCount = computed(
    () => this.orders().filter(o => o.status === 'SAMPLE_COLLECTED').length
  );

  readonly processingCount = computed(
    () => this.orders().filter(o => o.status === 'PROCESSING').length
  );

  readonly uploadedCount = computed(
    () => this.orders().filter(o => o.status === 'RESULT_UPLOADED').length
  );

  readonly filteredOrders = computed(() => {

    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.orders().filter(order => {

      const patient = order.medicalRecord.patient.user;

      const patientName =
        `${patient.firstName} ${patient.lastName}`.toLowerCase();

      const matchesSearch =
        patientName.includes(search) ||
        order.labTest.name.toLowerCase().includes(search) ||
        order.labTest.code.toLowerCase().includes(search);

      const matchesStatus =
        filter === 'ALL' || order.status === filter;

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  // Load orders
  loadOrders(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.laboratoryService.getLabOrders().subscribe({

      next: response => {

        this.orders.set(response.data);

        this.loading.set(false);

        // Refresh selected order if it still exists
        const selectedId = this.selectedOrder()?.id;

        if (selectedId) {
          const updated = response.data.find(o => o.id === selectedId);

          if (updated) {
            this.loadOrderDetails(selectedId, false);
          }
        }
      },

      error: error => {

        this.errorMessage.set(
          error.error?.error?.message ||
          error.error?.message ||
          'Unable to load laboratory orders.'
        );

        this.loading.set(false);
      }
    });
  }

  // Search
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  // Filter
  onFilterChange(value: string): void {
    this.selectedFilter.set(value as OrderFilter);
  }

  // View order details
  loadOrderDetails(id: string, showError = true): void {

    this.laboratoryService.getLabOrderById(id).subscribe({

      next: response => {
        this.selectedOrder.set(response.data);
      },

      error: error => {

        if (showError) {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to load order details.'
          );
        }
      }
    });
  }

  // Select order
  selectOrder(order: LaboratoryOrder): void {

    this.selectedOrder.set(order);
    this.showResultForm.set(false);
    this.formError.set('');

    this.loadOrderDetails(order.id);
  }

  // Clear selected order
  closeDetails(): void {
    if (this.actionLoading()) return;
    this.selectedOrder.set(null);
    this.showResultForm.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedOrder() && !this.actionLoading()) {
      this.closeDetails();
    }
  }

  // Collect sample
  collectSample(order: LaboratoryOrder): void {

    if (this.actionLoading()) {
      return;
    }

    this.executeOrderAction(
      order.id,
      () => this.laboratoryService.collectSample(order.id),
      'Sample collected successfully.'
    );
  }

  // Start processing
  startProcessing(order: LaboratoryOrder): void {

    if (this.actionLoading()) {
      return;
    }

    this.executeOrderAction(
      order.id,
      () => this.laboratoryService.startProcessing(order.id),
      'Laboratory processing started successfully.'
    );
  }

  // Open result form
  openResultForm(): void {

    this.resultText.set('');
    this.resultFileUrl.set('');
    this.formError.set('');

    this.showResultForm.set(true);
  }

  // Close result form
  closeResultForm(): void {

    if (this.actionLoading()) {
      return;
    }

    this.showResultForm.set(false);
    this.formError.set('');
  }

  // Upload result
  uploadResult(): void {

    const order = this.selectedOrder();

    if (!order || this.actionLoading()) {
      return;
    }

    if (!this.resultText().trim()) {
      this.formError.set('Please enter the laboratory result.');
      return;
    }

    const payload: UploadLabResult = {
      resultText: this.resultText().trim()
    };

    const fileUrl = this.resultFileUrl().trim();

    if (fileUrl) {
      try {
        const parsedUrl = new URL(fileUrl);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          this.formError.set('Enter a valid HTTP or HTTPS file URL.');
          return;
        }
      } catch {
        this.formError.set('Enter a valid result file URL.');
        return;
      }

      payload.resultFileUrl = fileUrl;
    }

    this.actionLoading.set(true);
    this.formError.set('');

    this.laboratoryService.uploadLabResult(
      order.id,
      payload
    ).subscribe({

      next: response => {

        this.selectedOrder.set(response.data);

        this.showResultForm.set(false);
        this.actionLoading.set(false);

        this.successMessage.set(
          'Laboratory result uploaded successfully.'
        );

        this.loadOrders();
      },

      error: error => {

        this.formError.set(
          error.error?.error?.message ||
          error.error?.message ||
          'Unable to upload laboratory result.'
        );

        this.actionLoading.set(false);
      }
    });
  }

  // Common action handler
  private executeOrderAction(
    id: string,
    request: () => import('rxjs').Observable<any>,
    successMessage: string
  ): void {

    this.actionLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    request().subscribe({

      next: response => {

        this.successMessage.set(
          response.message || successMessage
        );

        this.actionLoading.set(false);

        this.loadOrderDetails(id, false);
        this.loadOrders();
      },

      error: error => {

        this.errorMessage.set(
          error.error?.error?.message ||
          error.error?.message ||
          'Unable to update laboratory order.'
        );

        this.actionLoading.set(false);
      }
    });
  }

  // Status label
  getStatusLabel(status: LabOrderStatus): string {

    const labels: Record<LabOrderStatus, string> = {
      ORDERED: 'Ordered',
      SAMPLE_COLLECTED: 'Sample Collected',
      PROCESSING: 'Processing',
      RESULT_UPLOADED: 'Result Uploaded',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };

    return labels[status];
  }

  trackByOrderId(index: number, order: LaboratoryOrder): string {
    return order.id;
  }
}