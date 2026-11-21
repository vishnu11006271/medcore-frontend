import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../../../core/services/patient.service';
import { Patient } from '../../../../../core/models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss'
})
export class PatientListComponent implements OnInit {

  private readonly patientService = inject(PatientService);

  patients = signal<Patient[]>([]);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  searchTerm = '';

  currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [10, 25, 50] as const;
  totalPages = signal<number>(0);
  totalPatients = signal<number>(0);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.patientService.getPatients(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm
    ).subscribe({
      next: (response) => {
        this.patients.set(response.data.patients);

        this.totalPatients.set(
          response.data.pagination.total
        );

        this.totalPages.set(
          response.data.pagination.totalPages
        );

        this.loading.set(false);
      },

      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error?.message ||
          'Unable to load patients.'
        );

        this.loading.set(false);
      }
    });
  }

  searchPatients(): void {
    this.currentPage.set(1);
    this.loadPatients();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage.set(1);
    this.loadPatients();
  }

  changePageSize(value: number): void {
    if (!this.pageSizeOptions.some(option => option === value)) {
      return;
    }

    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadPatients();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadPatients();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadPatients();
    }
  }

  getPatientName(patient: Patient): string {
    return `${patient.user.firstName} ${patient.user.lastName}`;
  }

  getInitials(patient: Patient): string {
    return (
      patient.user.firstName.charAt(0) +
      patient.user.lastName.charAt(0)
    ).toUpperCase();
  }
}