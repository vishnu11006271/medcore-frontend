import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LaboratoryService } from '../../../../../../core/services/laboratory.service';

import {
  LaboratoryTest,
  CreateLaboratoryTest,
  UpdateLaboratoryTest
} from '../../../../../../core/models/laboratory.model';

type TestFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-laboratory-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboratory-tests.html',
  styleUrl: './laboratory-tests.scss'
})
export class LaboratoryTestsComponent implements OnInit {

  private readonly laboratoryService = inject(LaboratoryService);

  // Data
  readonly tests = signal<LaboratoryTest[]>([]);

  // Loading and errors
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Search and filter
  readonly searchTerm = signal('');
  readonly selectedFilter = signal<TestFilter>('ALL');

  // Form visibility
  readonly showForm = signal(false);
  readonly editingTest = signal<LaboratoryTest | null>(null);

  // Form fields
  readonly name = signal('');
  readonly code = signal('');
  readonly description = signal('');
  readonly price = signal<number | null>(null);

  // Form validation
  readonly formError = signal('');

  // Statistics
  readonly totalTests = computed(() => this.tests().length);

  readonly activeTests = computed(
    () => this.tests().filter(test => test.isActive).length
  );

  readonly inactiveTests = computed(
    () => this.tests().filter(test => !test.isActive).length
  );

  // Filtered test list
  readonly filteredTests = computed(() => {

    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.tests().filter(test => {

      const matchesSearch =
        test.name.toLowerCase().includes(search) ||
        test.code.toLowerCase().includes(search);

      const matchesStatus =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && test.isActive) ||
        (filter === 'INACTIVE' && !test.isActive);

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadTests();
  }

  // Fetch laboratory tests
  loadTests(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.laboratoryService.getLabTests().subscribe({

      next: response => {
        this.tests.set(response.data);
        this.loading.set(false);
      },

      error: error => {

        this.errorMessage.set(
          error.error?.error?.message ||
          error.error?.message ||
          'Unable to load laboratory tests.'
        );

        this.loading.set(false);
      }
    });
  }

  // Search
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  // Status filter
  onFilterChange(value: string): void {
    this.selectedFilter.set(value as TestFilter);
  }

  // Open create form
  openCreateForm(): void {

    this.editingTest.set(null);

    this.resetForm();

    this.showForm.set(true);
  }

  // Open edit form
  openEditForm(test: LaboratoryTest): void {

    this.editingTest.set(test);

    this.name.set(test.name);
    this.code.set(test.code);
    this.description.set(test.description || '');
    this.price.set(Number(test.price));

    this.formError.set('');

    this.showForm.set(true);
  }

  // Close form
  closeForm(): void {

    if (this.saving()) {
      return;
    }

    this.showForm.set(false);
    this.editingTest.set(null);

    this.resetForm();
  }

  // Reset form fields
  private resetForm(): void {

    this.name.set('');
    this.code.set('');
    this.description.set('');
    this.price.set(null);

    this.formError.set('');
  }

  // Validate form
  private validateForm(): boolean {

    if (!this.name().trim()) {
      this.formError.set('Test name is required.');
      return false;
    }

    if (!this.code().trim()) {
      this.formError.set('Test code is required.');
      return false;
    }

    if (
      this.price() === null ||
      !Number.isFinite(this.price()) ||
      this.price()! < 0
    ) {
      this.formError.set('Enter a valid non-negative price.');
      return false;
    }

    return true;
  }

  // Submit create/update form
  submitForm(): void {

    this.formError.set('');

    if (!this.validateForm()) {
      return;
    }

    const payload: CreateLaboratoryTest = {
      name: this.name().trim(),
      code: this.code().trim().toUpperCase(),
      description: this.description().trim(),
      price: Number(this.price())
    };

    this.saving.set(true);

    const editing = this.editingTest();

    if (editing) {

      const updatePayload: UpdateLaboratoryTest = {
        name: this.name().trim(),
        description: this.description().trim(),
        price: Number(this.price())
      };

      this.laboratoryService.updateLabTest(
        editing.id,
        updatePayload
      ).subscribe({

        next: response => {
          this.successMessage.set(
            response.message || 'Laboratory test updated successfully.'
          );

          this.saving.set(false);
          this.showForm.set(false);
          this.editingTest.set(null);

          this.loadTests();
        },

        error: error => {
          this.handleSaveError(error);
        }
      });

    } else {

      this.laboratoryService.createLabTest(payload).subscribe({

        next: response => {

          this.successMessage.set(
            response.message || 'Laboratory test created successfully.'
          );

          this.saving.set(false);
          this.showForm.set(false);

          this.loadTests();
        },

        error: error => {
          this.handleSaveError(error);
        }
      });
    }
  }

  // Activate / deactivate
  toggleTestStatus(test: LaboratoryTest): void {

    const newStatus = !test.isActive;

    const payload: UpdateLaboratoryTest = {
      isActive: newStatus
    };

    this.errorMessage.set('');
    this.successMessage.set('');

    this.laboratoryService.updateLabTest(
      test.id,
      payload
    ).subscribe({

      next: response => {

        this.successMessage.set(
          newStatus
            ? 'Laboratory test activated successfully.'
            : 'Laboratory test deactivated successfully.'
        );

        this.loadTests();
      },

      error: error => {

        this.errorMessage.set(
          error.error?.error?.message ||
          'Unable to update test status.'
        );
      }
    });
  }

  // API save error
  private handleSaveError(error: any): void {

    this.formError.set(
      error.error?.error?.message ||
      error.error?.message ||
      'Unable to save laboratory test.'
    );

    this.saving.set(false);
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  trackByTestId(
    index: number,
    test: LaboratoryTest
  ): string {
    return test.id;
  }

  onPriceChange(value: string | number): void {
    this.price.set(value === '' ? null : Number(value));
  }
}