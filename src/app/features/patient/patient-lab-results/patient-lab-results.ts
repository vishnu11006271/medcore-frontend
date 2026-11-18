import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { PatientLabResult } from '../../../core/models/laboratory.model';

@Component({
  selector: 'app-patient-lab-results',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './patient-lab-results.html',
  styleUrl: './patient-lab-results.scss'
})
export class PatientLabResults implements OnInit {
  private laboratoryService = inject(LaboratoryService);

  results = signal<PatientLabResult[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  searchTerm = signal('');

  filteredResults = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return this.results();
    }

    return this.results().filter(result =>
      result.labTest.name.toLowerCase().includes(search) ||
      result.labTest.code.toLowerCase().includes(search) ||
      result.medicalRecord.diagnosis.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.laboratoryService.getPatientResults().subscribe({
      next: (data) => {
        this.results.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.error?.message ||
          'Unable to load laboratory results. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  openReport(url: string | null): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  trackById(index: number, result: PatientLabResult): string {
    return result.id;
  }
}