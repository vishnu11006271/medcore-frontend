import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';



import { UserRole } from '../../../../core/models/auth.model';
import { UsersService } from '../../../../core/services/users.service';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state';
import { PlatformUser, UsersPagination } from '../../../../core/models/user-management.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataStateComponent],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss'
})
export class UsersList implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  readonly users = signal<PlatformUser[]>([]);

  readonly loading = signal(false);
  readonly updatingStatus = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly pendingUser = signal<PlatformUser | null>(null);
  readonly statusError = signal<string | null>(null);

  readonly pagination = signal<UsersPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  readonly roles: UserRole[] = [
    'SUPER_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'ACCOUNTANT',
    'PATIENT'
  ];

  readonly filtersForm = this.formBuilder.nonNullable.group({
    search: [''],
    role: [''],
    hospitalId: [''],
    isActive: [''],
    emailVerified: ['']
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = 1): void {
    if (this.loading()) {
      return;
    }

    const filters = this.filtersForm.getRawValue();

    this.loading.set(true);
    this.errorMessage.set(null);

    this.usersService.getUsers({
      search: filters.search.trim(),
      role: filters.role as UserRole | '',
      hospitalId: filters.hospitalId.trim(),
      isActive: filters.isActive,
      emailVerified: filters.emailVerified,
      page,
      limit: this.pagination().limit
    })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.users.set(response.data.users);

          this.pagination.set({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            totalPages: response.data.pagination.totalPages,
            hasNextPage: response.data.pagination.hasNextPage,
            hasPreviousPage: response.data.pagination.hasPreviousPage
          });

          this.successMessage.set(null);
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.error?.message ||
            'Unable to load users. Please try again.'
          );
        }
      });
  }

  applyFilters(): void {
    this.loadUsers(1);
  }

  resetFilters(): void {
    this.filtersForm.reset({
      search: '',
      role: '',
      hospitalId: '',
      isActive: '',
      emailVerified: ''
    });

    this.loadUsers(1);
  }

  goToPreviousPage(): void {
    const current = this.pagination();

    if (current.hasPreviousPage && !this.loading()) {
      this.loadUsers(current.page - 1);
    }
  }

  goToNextPage(): void {
    const current = this.pagination();

    if (current.hasNextPage && !this.loading()) {
      this.loadUsers(current.page + 1);
    }
  }

  requestStatusChange(user: PlatformUser): void {
    this.statusError.set(null);
    this.pendingUser.set(user);
  }

  cancelStatusChange(): void {
    if (this.updatingStatus()) {
      return;
    }

    this.pendingUser.set(null);
    this.statusError.set(null);
  }

  confirmStatusChange(): void {
    const user = this.pendingUser();

    if (!user || this.updatingStatus()) {
      return;
    }

    this.updatingStatus.set(true);
    this.statusError.set(null);

    this.usersService.updateUserStatus(
      user.id,
      !user.isActive
    )
      .pipe(
        finalize(() => this.updatingStatus.set(false))
      )
      .subscribe({
        next: response => {
          this.users.update(items =>
            items.map(item =>
              item.id === response.data.id
                ? { ...item, ...response.data }
                : item
            )
          );

          this.successMessage.set(response.message);
          this.pendingUser.set(null);
        },
        error: error => {
          this.statusError.set(
            error?.error?.error?.message ||
            'Unable to update user status. Please try again.'
          );
        }
      });
  }

  getFullName(user: PlatformUser): string {
    return `${user.firstName} ${user.lastName}`;
  }
}