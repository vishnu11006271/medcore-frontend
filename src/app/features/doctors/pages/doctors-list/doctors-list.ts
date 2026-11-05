
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { DoctorService } from '../../../../core/services/doctor.service';

import {
  Doctor,
  HospitalOption,
  DepartmentOption,
  CreateDoctorRequest,
  UpdateDoctorRequest
} from '../../../../core/models/doctor.model';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctors-list.html',
  styleUrl: './doctors-list.scss'
})
export class DoctorsList implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly doctorService = inject(DoctorService);

  readonly currentUser = this.authService.user;

  readonly currentRole = computed(
    () => this.currentUser()?.role ?? null
  );

  readonly isSuperAdmin = computed(
    () => this.currentRole() === 'SUPER_ADMIN'
  );

  readonly hospitals = signal<HospitalOption[]>([]);
  readonly departments = signal<DepartmentOption[]>([]);
  readonly doctors = signal<Doctor[]>([]);

  readonly selectedHospitalId = signal<string>('');

  readonly isLoadingHospitals = signal(false);
  readonly isLoadingDepartments = signal(false);
  readonly isLoadingDoctors = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal('ALL');

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly filteredDoctors = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.doctors().filter(doctor => {
      const fullName =
        `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        doctor.user.email.toLowerCase().includes(search) ||
        doctor.specialization.toLowerCase().includes(search) ||
        doctor.licenseNumber.toLowerCase().includes(search);

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && doctor.user.isActive) ||
        (status === 'INACTIVE' && !doctor.user.isActive);

      return matchesSearch && matchesStatus;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(this.filteredDoctors().length / this.pageSize())
    )
  );

  readonly paginatedDoctors = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredDoctors().slice(
      start,
      start + this.pageSize()
    );
  });

  private readonly fb = inject(FormBuilder);

  readonly showCreateForm = signal(false);
  readonly isSavingDoctor = signal(false);

  readonly doctorForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    temporaryPassword: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [
      Validators.pattern(/^\+?[0-9]{10,15}$/)
    ]],
    departmentId: [''],
    licenseNumber: ['', Validators.required],
    specialization: ['', Validators.required],
    qualification: [''],
    experienceYears: [0, [
      Validators.required,
      Validators.min(0),
      Validators.max(60),
      Validators.pattern(/^\d+$/)
    ]],

    consultationFee: [0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]],
    bio: ['']
  });

  readonly showEditForm = signal(false);
  readonly isUpdatingDoctor = signal(false);
  readonly editingDoctorId = signal<string | null>(null);

  readonly editDoctorForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [
      Validators.pattern(/^\+?[0-9]{10,15}$/)
    ]],
    departmentId: [''],
    specialization: ['', Validators.required],
    qualification: [''],
    experienceYears: [0, [
      Validators.required,
      Validators.min(0),
      Validators.max(60),
      Validators.pattern(/^\d+$/)
    ]],

    consultationFee: [0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]],
    bio: ['']
  });

  readonly showDetails = signal(false);
  readonly selectedDoctor = signal<Doctor | null>(null);
  readonly isLoadingDetails = signal(false);

  ngOnInit(): void {
    const user = this.currentUser();

    if (!user) {
      this.errorMessage.set('User information is unavailable.');
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      this.loadHospitals();
      return;
    }

    if (user.role === 'HOSPITAL_ADMIN') {
      if (!user.hospitalId) {
        this.errorMessage.set(
          'Your account is not assigned to a hospital.'
        );
        return;
      }

      this.selectedHospitalId.set(user.hospitalId);
      this.loadDepartments(user.hospitalId);
      this.loadDoctors(user.hospitalId);
    }
  }

  loadHospitals(): void {
    this.isLoadingHospitals.set(true);
    this.errorMessage.set(null);

    this.doctorService.getHospitals()
      .pipe(
        finalize(() => this.isLoadingHospitals.set(false))
      )
      .subscribe({
        next: response => {
          this.hospitals.set(response.data);
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to load hospitals.'
          );
        }
      });
  }

  onHospitalChange(hospitalId: string): void {
    this.selectedHospitalId.set(hospitalId);

    this.departments.set([]);
    this.doctors.set([]);
    this.currentPage.set(1);
    this.errorMessage.set(null);

    if (!hospitalId) {
      return;
    }

    this.loadDepartments(hospitalId);
    this.loadDoctors(hospitalId);
  }

  loadDepartments(hospitalId: string): void {
    this.isLoadingDepartments.set(true);
    this.errorMessage.set(null);

    this.doctorService.getDepartments(hospitalId)
      .pipe(
        finalize(() => this.isLoadingDepartments.set(false))
      )
      .subscribe({
        next: response => {
          this.departments.set(
            response.data.filter(department => department.isActive)
          );
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to load departments.'
          );
        }
      });
  }

  loadDoctors(hospitalId: string): void {
    this.isLoadingDoctors.set(true);
    this.errorMessage.set(null);

    this.doctorService.getDoctors(hospitalId)
      .pipe(
        finalize(() => this.isLoadingDoctors.set(false))
      )
      .subscribe({
        next: response => {
          this.doctors.set(response.data);
          this.currentPage.set(1);
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to load doctors.'
          );
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  openCreateForm(): void {
    this.doctorForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      temporaryPassword: '',
      phone: '',
      departmentId: '',
      licenseNumber: '',
      specialization: '',
      qualification: '',
      experienceYears: 0,
      consultationFee: 0,
      bio: ''
    });

    this.errorMessage.set(null);
    this.showCreateForm.set(true);
  }

  closeCreateForm(): void {
    if (this.isSavingDoctor()) {
      return;
    }

    this.showCreateForm.set(false);
    this.errorMessage.set(null);
  }

  
  createDoctor(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const hospitalId = this.selectedHospitalId();

    if (!hospitalId) {
      this.errorMessage.set('Please select a hospital.');
      return;
    }

    const formValue = this.doctorForm.getRawValue();

    // Validate required string fields
    const email = formValue.email?.trim() ?? '';
    const firstName = formValue.firstName?.trim() ?? '';
    const lastName = formValue.lastName?.trim() ?? '';
    const licenseNumber = formValue.licenseNumber?.trim() ?? '';
    const specialization = formValue.specialization?.trim() ?? '';
    const temporaryPassword = formValue.temporaryPassword ?? '';

    const payload: CreateDoctorRequest = {
      email,
      temporaryPassword,
      firstName,
      lastName,
      licenseNumber,
      specialization,
      experienceYears: Number(formValue.experienceYears),
      consultationFee: Number(formValue.consultationFee),

      ...(formValue.phone?.trim() && {
        phone: formValue.phone.trim()
      }),

      ...(formValue.departmentId && {
        departmentId: formValue.departmentId
      }),

      ...(formValue.qualification?.trim() && {
        qualification: formValue.qualification.trim()
      }),

      ...(formValue.bio?.trim() && {
        bio: formValue.bio.trim()
      })
    };

    this.isSavingDoctor.set(true);
    this.errorMessage.set(null);

    this.doctorService.createDoctor(hospitalId, payload)
      .pipe(
        finalize(() => this.isSavingDoctor.set(false))
      )
      .subscribe({
        next: () => {
          this.showCreateForm.set(false);

          this.doctorForm.reset({
            firstName: '',
            lastName: '',
            email: '',
            temporaryPassword: '',
            phone: '',
            departmentId: '',
            licenseNumber: '',
            specialization: '',
            qualification: '',
            experienceYears: 0,
            consultationFee: 0,
            bio: ''
          });

          this.loadDoctors(hospitalId);
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to create doctor. Please try again.'
          );
        }
      });
  }

  openEditForm(doctor: Doctor): void {
    this.editingDoctorId.set(doctor.id);

    this.editDoctorForm.reset({
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      phone: doctor.user.phone ?? '',
      departmentId: doctor.departmentId ?? '',
      specialization: doctor.specialization,
      qualification: doctor.qualification ?? '',
      experienceYears: doctor.experienceYears,
      consultationFee: Number(doctor.consultationFee),
      bio: doctor.bio ?? ''
    });

    this.errorMessage.set(null);
    this.showCreateForm.set(false);
    this.showEditForm.set(true);
  }

  closeEditForm(): void {
    if (this.isUpdatingDoctor()) {
      return;
    }

    this.showEditForm.set(false);
    this.editingDoctorId.set(null);
    this.editDoctorForm.reset();
    this.errorMessage.set(null);
  }

  updateDoctor(): void {
    if (this.editDoctorForm.invalid) {
      this.editDoctorForm.markAllAsTouched();
      return;
    }

    const doctorId = this.editingDoctorId();

    if (!doctorId) {
      this.errorMessage.set('No doctor selected for editing.');
      return;
    }

    const formValue = this.editDoctorForm.getRawValue();

    // const payload: UpdateDoctorRequest = {
    //   firstName: formValue.firstName?.trim() ?? '',
    //   lastName: formValue.lastName?.trim() ?? '',
    //   specialization: formValue.specialization?.trim() ?? '',
    //   experienceYears: Number(formValue.experienceYears),
    //   consultationFee: Number(formValue.consultationFee),

    //   ...(formValue.phone?.trim()
    //     ? { phone: formValue.phone.trim() }
    //     : { phone: '' }),

    //   departmentId: formValue.departmentId || null,

    //   ...(formValue.qualification?.trim()
    //     ? { qualification: formValue.qualification.trim() }
    //     : { qualification: '' }),

    //   ...(formValue.bio?.trim()
    //     ? { bio: formValue.bio.trim() }
    //     : { bio: '' })
    // };

    const payload: UpdateDoctorRequest = {
      firstName: formValue.firstName?.trim() || undefined,
      lastName: formValue.lastName?.trim() || undefined,
      specialization: formValue.specialization?.trim() || undefined,

      experienceYears: Number(formValue.experienceYears),
      consultationFee: Number(formValue.consultationFee),

      phone: formValue.phone?.trim() || undefined,
      departmentId: formValue.departmentId || undefined,
      qualification: formValue.qualification?.trim() || undefined,
      bio: formValue.bio?.trim() || undefined
    };
    this.isUpdatingDoctor.set(true);
    this.errorMessage.set(null);

    this.doctorService.updateDoctor(doctorId, payload)
      .pipe(
        finalize(() => this.isUpdatingDoctor.set(false))
      )
      .subscribe({
        next: () => {
          this.showEditForm.set(false);
          this.editingDoctorId.set(null);
          this.editDoctorForm.reset();

          const hospitalId = this.selectedHospitalId();

          if (hospitalId) {
            this.loadDoctors(hospitalId);
          }
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to update doctor. Please try again.'
          );
        }
      });
  }

  toggleDoctorStatus(doctor: Doctor): void {
    const newStatus = !doctor.user.isActive;

    const action = newStatus ? 'activate' : 'deactivate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} Dr. ${doctor.user.firstName} ${doctor.user.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set(null);

    this.doctorService.updateDoctorStatus(doctor.id, newStatus)
      .subscribe({
        next: () => {
          const hospitalId = this.selectedHospitalId();

          if (hospitalId) {
            this.loadDoctors(hospitalId);
          }
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            `Unable to ${action} doctor. Please try again.`
          );
        }
      });
  }

  viewDoctorDetails(doctor: Doctor): void {
    this.isLoadingDetails.set(true);
    this.errorMessage.set(null);

    this.doctorService.getDoctorById(doctor.id)
      .pipe(
        finalize(() => this.isLoadingDetails.set(false))
      )
      .subscribe({
        next: response => {
          this.selectedDoctor.set(response.data);
          this.showDetails.set(true);
        },
        error: error => {
          this.errorMessage.set(
            error.error?.error?.message ||
            'Unable to load doctor details.'
          );
        }
      });
  }

  closeDoctorDetails(): void {
    this.showDetails.set(false);
    this.selectedDoctor.set(null);
  }

}
