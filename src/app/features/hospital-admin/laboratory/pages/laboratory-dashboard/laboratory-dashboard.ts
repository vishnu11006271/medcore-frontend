
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { LaboratoryService } from
  '../../../../../core/services/laboratory.service';

import {
  LaboratoryDashboard
} from '../../../../../core/models/laboratory.model';

@Component({
  selector: 'app-laboratory-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './laboratory-dashboard.html',
  styleUrl: './laboratory-dashboard.scss'
})
export class LaboratoryDashboardComponent implements OnInit {

  private readonly laboratoryService = inject(LaboratoryService);

  readonly dashboard = signal<LaboratoryDashboard | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.laboratoryService.getAdminDashboard().subscribe({
      next: (response) => {
        this.dashboard.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.error?.message ||
          'Unable to load laboratory dashboard.'
        );

        this.loading.set(false);
      }
    });
  }

  getStatusItems() {
    const orders = this.dashboard()?.orders;

    if (!orders) {
      return [];
    }

    return [
      { label: 'Ordered', value: orders.ordered, className: 'ordered' },
      { label: 'Sample Collected', value: orders.sampleCollected, className: 'collected' },
      { label: 'Processing', value: orders.processing, className: 'processing' },
      { label: 'Result Uploaded', value: orders.resultUploaded, className: 'uploaded' },
      { label: 'Approved', value: orders.approved, className: 'approved' },
      { label: 'Rejected', value: orders.rejected, className: 'rejected' },
      { label: 'Completed', value: orders.completed, className: 'completed' },
      { label: 'Cancelled', value: orders.cancelled, className: 'cancelled' }
    ];
  }
}