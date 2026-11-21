import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { TableContainerComponent } from '../../../../shared/components/table-container/table-container';
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
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { HospitalService } from '../../../../core/services/hospital.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';

import { Hospital } from '../../../../core/models/hospital.model';

import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../../../../core/models/department.model';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [PageHeaderComponent, TableContainerComponent,
    CommonModule,
    ReactiveFormsModule,
    DataStateComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './departments-list.html',
  styleUrl: './departments-list.scss'
})
export class DepartmentsListComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly hospitalService = inject(HospitalService);
  private readonly departmentService = inject(DepartmentService);

  // Current logged-in user
  readonly currentUser = this.authService.user;

  // Hospital data
  readonly hospitals = signal<Hospital[]>([]);
  readonly selectedHospitalId = signal<string>('');

  // Department data
  readonly departments = signal<Department[]>([]);

  // Loading and error states
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isLoadingHospitals = signal<boolean>(false);

  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  // Form visibility and edit state
  readonly showForm = signal<boolean>(false);
  readonly editingDepartmentId = signal<string | null>(null);

  // Search and filters
  readonly searchTerm = signal<string>('');
  readonly statusFilter = signal<StatusFilter>('ALL');

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly pageSize = 5;

  // Status confirmation
  readonly pendingStatusDepartment = signal<Department | null>(null);
  readonly statusError = signal<string>('');

  readonly isSuperAdmin = computed(
    () => this.currentUser()?.role === 'SUPER_ADMIN'
  );

  readonly departmentForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]],
    code: ['', [
      Validators.maxLength(20)
    ]],
    description: ['', [
      Validators.maxLength(500)
    ]]
  });

  // Apply search and status filters
  readonly filteredDepartments = computed(() => {

    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.departments().filter((department) => {

      const matchesSearch =
        !search ||
        department.name.toLowerCase().includes(search) ||
        (department.code ?? '').toLowerCase().includes(search) ||
        (department.description ?? '').toLowerCase().includes(search);

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && department.isActive) ||
        (status === 'INACTIVE' && !department.isActive);

      return matchesSearch && matchesStatus;
    });
  });

  // Calculate total pages
  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(this.filteredDepartments().length / this.pageSize)
    )
  );

  // Departments displayed on the current page
  readonly paginatedDepartments = computed(() => {

    const startIndex = (this.currentPage() - 1) * this.pageSize;

    return this.filteredDepartments().slice(
      startIndex,
      startIndex + this.pageSize
    );
  });

  ngOnInit(): void {
    this.initializePage();
  }

  // Initialize according to the logged-in user's role
  private initializePage(): void {

    const user = this.currentUser();

    if (!user) {
      this.errorMessage.set('Unable to identify the logged-in user.');
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      this.loadHospitals();
      return;
    }

    if (user.role === 'HOSPITAL_ADMIN' && user.hospitalId) {
      this.selectedHospitalId.set(user.hospitalId);
      this.loadDepartments(user.hospitalId);
      return;
    }

    this.errorMessage.set(
      'You are not authorized to manage departments.'
    );
  }

  // Load hospitals for SUPER_ADMIN
  private loadHospitals(): void {

    this.isLoadingHospitals.set(true);
    this.errorMessage.set('');

    this.hospitalService.getHospitals()
      .pipe(
        finalize(() => this.isLoadingHospitals.set(false))
      )
      .subscribe({
        next: (response) => {

          this.hospitals.set(response.data ?? []);

          if (this.hospitals().length > 0) {
            const firstHospital = this.hospitals()[0];

            this.selectedHospitalId.set(firstHospital.id);
            this.loadDepartments(firstHospital.id);
          }
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.error?.message ??
            'Unable to load hospitals.'
          );
        }
      });
  }

  // Handle hospital selection
  onHospitalChange(hospitalId: string): void {

    this.selectedHospitalId.set(hospitalId);
    this.departments.set([]);
    this.currentPage.set(1);
    this.closeForm();
    this.clearMessages();

    if (hospitalId) {
      this.loadDepartments(hospitalId);
    }
  }

  // Load departments for the selected hospital
  loadDepartments(hospitalId?: string): void {

    const id = hospitalId ?? this.selectedHospitalId();

    if (!id) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.departmentService.getDepartments(id)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.departments.set(response.data ?? []);
          this.currentPage.set(1);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.error?.message ??
            'Unable to load departments.'
          );
        }
      });
  }

  // Open form for creating a department
  openCreateForm(): void {

    this.editingDepartmentId.set(null);

    this.departmentForm.reset({
      name: '',
      code: '',
      description: ''
    });

    this.clearMessages();
    this.showForm.set(true);
  }

  // Open form for editing an existing department
  openEditForm(department: Department): void {

    this.editingDepartmentId.set(department.id);

    this.departmentForm.patchValue({
      name: department.name,
      code: department.code ?? '',
      description: department.description ?? ''
    });

    this.clearMessages();
    this.showForm.set(true);
  }

  // Close create/edit form
  closeForm(): void {

    this.showForm.set(false);
    this.editingDepartmentId.set(null);
    this.departmentForm.reset({
      name: '',
      code: '',
      description: ''
    });
  }

  // Create or update department
  saveDepartment(): void {

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const hospitalId = this.selectedHospitalId();

    if (!hospitalId) {
      this.errorMessage.set('Please select a hospital.');
      return;
    }

    const formValue = this.departmentForm.getRawValue();

    const payload = {
      name: formValue.name.trim(),
      code: formValue.code.trim(),
      description: formValue.description.trim()
    };

    this.isSaving.set(true);
    this.clearMessages();

    const departmentId = this.editingDepartmentId();

    if (departmentId) {

      const updatePayload: UpdateDepartmentRequest = {
        name: payload.name,
        code: payload.code || null,
        description: payload.description || null
      };

      this.departmentService.updateDepartment(
        departmentId,
        updatePayload
      )
        .pipe(
          finalize(() => this.isSaving.set(false))
        )
        .subscribe({
          next: () => {
            this.successMessage.set(
              'Department updated successfully.'
            );

            this.closeForm();
            this.loadDepartments(hospitalId);
          },
          error: (error) => {
            this.errorMessage.set(
              error?.error?.error?.message ??
              'Unable to update department.'
            );
          }
        });

    } else {

      const createPayload: CreateDepartmentRequest = {
        name: payload.name,
        ...(payload.code && { code: payload.code }),
        ...(payload.description && {
          description: payload.description
        })
      };

      this.departmentService.createDepartment(
        hospitalId,
        createPayload
      )
        .pipe(
          finalize(() => this.isSaving.set(false))
        )
        .subscribe({
          next: () => {
            this.successMessage.set(
              'Department created successfully.'
            );

            this.closeForm();
            this.loadDepartments(hospitalId);
          },
          error: (error) => {
            this.errorMessage.set(
              error?.error?.error?.message ??
              'Unable to create department.'
            );
          }
        });
    }
  }

  // Ask for confirmation before changing department status
  requestStatusChange(department: Department): void {
    this.pendingStatusDepartment.set(department);
    this.statusError.set('');
    this.clearMessages();
  }

  cancelStatusChange(): void {
    if (this.isSaving()) {
      return;
    }

    this.pendingStatusDepartment.set(null);
    this.statusError.set('');
  }

  // Activate or deactivate department
  confirmStatusChange(): void {

    const department = this.pendingStatusDepartment();

    if (!department) {
      return;
    }

    const newStatus = !department.isActive;

    this.isSaving.set(true);
    this.statusError.set('');
    this.clearMessages();

    this.departmentService.updateDepartmentStatus(
      department.id,
      { isActive: newStatus }
    )
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {

          this.successMessage.set(
            newStatus
              ? 'Department activated successfully.'
              : 'Department deactivated successfully.'
          );

          this.pendingStatusDepartment.set(null);
          this.loadDepartments();
        },
        error: (error) => {
          this.statusError.set(
            error?.error?.error?.message ??
            'Unable to update department status. Please try again.'
          );
        }
      });
  }

  // Search departments
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  // Filter by status
  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.currentPage.set(1);
  }

  // Pagination
  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  // Clear messages
  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}