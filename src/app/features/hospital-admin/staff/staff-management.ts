import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StaffService } from '../../../core/services/staff.service';
import { StaffMember, StaffRole } from '../../../core/models/staff.model';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-management.html',
  styleUrl: './staff-management.scss'
})
export class StaffManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly staffService = inject(StaffService);

  readonly staff = signal<StaffMember[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly updatingStaffIds = signal<string[]>([]);
  readonly error = signal('');
  readonly success = signal('');

  readonly roles: { value: StaffRole; label: string }[] = [
    { value: 'NURSE', label: 'Nurse' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
    { value: 'ACCOUNTANT', label: 'Accountant' }
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.pattern(/^\+?[0-9]{10,15}$/)]],
    role: ['NURSE' as StaffRole, Validators.required],
    temporaryPassword: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]]
  });

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading.set(true);
    this.error.set('');
    this.staffService.getStaff().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: response => this.staff.set(response.data),
      error: error => this.error.set(
        error?.error?.error?.message || 'Unable to load staff members.'
      )
    });
  }

  createStaff(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);
    this.staffService.createStaff({
      ...value,
      email: value.email.trim().toLowerCase(),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phone: value.phone.trim() || undefined
    }).pipe(
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: response => {
        this.success.set(`Verification email sent to ${response.data.user.email}.`);
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'NURSE',
          temporaryPassword: ''
        });
        this.loadStaff();
      },
      error: error => this.error.set(
        error?.error?.error?.message || 'Unable to create the staff account.'
      )
    });
  }

  toggleStatus(member: StaffMember): void {
    if (this.updatingStaffIds().includes(member.id)) return;

    const nextStatus = !member.isActive;
    const action = nextStatus ? 'activate' : 'deactivate';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${member.firstName} ${member.lastName}?`
    );
    if (!confirmed) return;

    this.error.set('');
    this.updatingStaffIds.update(ids => [...ids, member.id]);

    this.staffService.updateStatus(member.id, nextStatus).pipe(
      finalize(() => this.updatingStaffIds.update(
        ids => ids.filter(id => id !== member.id)
      ))
    ).subscribe({
      next: response => this.staff.update(items =>
        items.map(item => item.id === member.id ? response.data : item)
      ),
      error: error => this.error.set(
        error?.error?.error?.message || 'Unable to update staff status.'
      )
    });
  }
}
