
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AppointmentService } from '../../../../core/services/appointment.service';
import { MedicalRecordService } from '../../../../core/services/medical-record.service';

import { DoctorAppointment } from '../../../../core/models/appointment.model';
import {
  MedicalRecord,
  CreateMedicalRecordRequest,
  CreateVitalSignRequest,
  VitalSign
} from '../../../../core/models/medical-record.model';

import { LaboratoryService } from '../../../../core/services/laboratory.service';

import {
  LaboratoryTest,
  CreateLaboratoryOrder,
  LaboratoryOrder,
  ApproveLabResult
} from '../../../../core/models/laboratory.model';

@Component({
  selector: 'app-doctor-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-medical-records.html',
  styleUrl: './doctor-medical-records.scss'
})
export class DoctorMedicalRecords implements OnInit {
  private appointmentService = inject(AppointmentService);
  private medicalRecordService = inject(MedicalRecordService);
  private laboratoryService = inject(LaboratoryService);

  appointments = signal<DoctorAppointment[]>([]);
  records = signal<MedicalRecord[]>([]);
  selectedRecord = signal<MedicalRecord | null>(null);
  vitals = signal<VitalSign[]>([]);

  loading = signal(false);
  saving = signal(false);
  loadingDetails = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  searchTerm = signal('');
  selectedStatus = signal('ALL');

  showRecordForm = signal(false);
  showDetails = signal(false);
  showVitalsForm = signal(false);

  editingRecordId = signal<string | null>(null);

  recordForm: CreateMedicalRecordRequest = {
    appointmentId: '',
    diagnosis: '',
    symptoms: '',
    clinicalNotes: '',
    treatmentPlan: ''
  };

  vitalForm: CreateVitalSignRequest = {};

  labTests = signal<LaboratoryTest[]>([]);
  createdLabOrder = signal<LaboratoryOrder | null>(null);

  showLabOrderForm = signal(false);
  loadingLabTests = signal(false);
  labOrderSaving = signal(false);

  selectedLabTestId = '';
  labOrderNotes = '';

  labOrders = signal<LaboratoryOrder[]>([]);
  approvalNotes: Record<string, string> = {};
  approvingOrderId = signal<string | null>(null);

  filteredAppointments = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.appointments().filter(appointment => {
      const patientName =
        `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`.toLowerCase();

      const matchesSearch =
        !search ||
        patientName.includes(search) ||
        (appointment.reason || '').toLowerCase().includes(search);

      const matchesStatus =
        status === 'ALL' || appointment.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    let completedRequests = 0;

    const finishLoading = () => {
      completedRequests++;

      if (completedRequests === 2) {
        this.loading.set(false);
      }
    };

    this.appointmentService.getDoctorAppointments().subscribe({
      next: response => {
        this.appointments.set(response.data || []);
        finishLoading();
      },
      error: error => {
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to load appointments.'));
        finishLoading();
      }
    });

    this.medicalRecordService.getDoctorRecords().subscribe({
      next: response => {
        this.records.set(response.data || []);
        finishLoading();
      },
      error: error => {
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to load medical records.'));
        finishLoading();
      }
    });
  }

  getPatientName(appointment: DoctorAppointment): string {
    return `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
  }

  getRecordForAppointment(appointmentId: string): MedicalRecord | undefined {
    return this.records().find(record => record.appointmentId === appointmentId);
  }

  canCreateRecord(appointment: DoctorAppointment): boolean {
    return (
      appointment.status === 'IN_PROGRESS' ||
      appointment.status === 'COMPLETED'
    ) && !this.getRecordForAppointment(appointment.id);
  }

  openCreateForm(appointment: DoctorAppointment): void {
    if (!this.canCreateRecord(appointment)) {
      return;
    }

    this.resetRecordForm();

    this.recordForm.appointmentId = appointment.id;
    this.editingRecordId.set(null);
    this.showRecordForm.set(true);
    this.showDetails.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  openEditForm(record: MedicalRecord): void {
    if (record.status !== 'DRAFT') {
      return;
    }

    this.recordForm = {
      appointmentId: record.appointmentId,
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms || '',
      clinicalNotes: record.clinicalNotes || '',
      treatmentPlan: record.treatmentPlan || ''
    };

    this.editingRecordId.set(record.id);
    this.showRecordForm.set(true);
    this.showDetails.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  saveRecord(): void {
    if (!this.recordForm.appointmentId) {
      this.errorMessage.set('Please select an appointment.');
      return;
    }

    if (
      !this.recordForm.diagnosis?.trim() &&
      !this.recordForm.symptoms?.trim() &&
      !this.recordForm.clinicalNotes?.trim() &&
      !this.recordForm.treatmentPlan?.trim()
    ) {
      this.errorMessage.set('Please enter at least one medical record field.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const editingId = this.editingRecordId();

    if (editingId) {
      const { appointmentId, ...payload } = this.recordForm;

      this.medicalRecordService.updateMedicalRecord(editingId, payload).subscribe({
        next: response => {
          this.saving.set(false);
          this.showRecordForm.set(false);
          this.successMessage.set('Medical record updated successfully.');
          this.loadPageData();
          this.openRecordDetails(response.data.id);
        },
        error: error => {
          this.saving.set(false);
          this.errorMessage.set(this.getErrorMessage(error, 'Unable to update medical record.'));
        }
      });

      return;
    }

    this.medicalRecordService.createMedicalRecord(this.recordForm).subscribe({
      next: response => {
        this.saving.set(false);
        this.showRecordForm.set(false);
        this.successMessage.set('Medical record created successfully.');
        this.loadPageData();
        this.openRecordDetails(response.data.id);
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to create medical record.'));
      }
    });
  }

  openRecordDetails(recordId: string): void {
    this.loadingDetails.set(true);
    this.errorMessage.set('');
    this.showDetails.set(true);
    this.showRecordForm.set(false);

    this.medicalRecordService.getMedicalRecordById(recordId).subscribe({
      next: response => {
        this.selectedRecord.set(response.data);
        this.loadingDetails.set(false);
        this.loadVitals(recordId);
        this.loadLabOrders();
      },
      error: error => {
        this.loadingDetails.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to load medical record.'));
      }
    });
  }

  loadVitals(recordId: string): void {
    this.medicalRecordService.getVitals(recordId).subscribe({
      next: response => this.vitals.set(response.data || []),
      error: error => this.errorMessage.set(this.getErrorMessage(error, 'Unable to load vital signs.'))
    });
  }

  openVitalsForm(): void {
    if (this.selectedRecord()?.status !== 'DRAFT') {
      return;
    }

    this.vitalForm = {};
    this.showVitalsForm.set(true);
  }

  saveVitals(): void {
    const record = this.selectedRecord();

    if (!record) {
      return;
    }

    const measurements = [
      this.vitalForm.systolicBP,
      this.vitalForm.diastolicBP,
      this.vitalForm.pulseBpm,
      this.vitalForm.temperatureC,
      this.vitalForm.respiratoryRate,
      this.vitalForm.oxygenSaturation,
      this.vitalForm.heightCm,
      this.vitalForm.weightKg
    ];

    if (measurements.every(value => value === undefined || value === null)) {
      this.errorMessage.set('Enter at least one vital measurement.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.medicalRecordService.addVitals(record.id, this.vitalForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showVitalsForm.set(false);
        this.successMessage.set('Vital signs recorded successfully.');
        this.loadVitals(record.id);
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to save vital signs.'));
      }
    });
  }

  finalizeRecord(): void {
    const record = this.selectedRecord();

    if (!record || record.status !== 'DRAFT') {
      return;
    }

    if (!window.confirm('Are you sure you want to finalize this medical record? You will not be able to edit it afterward.')) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.medicalRecordService.finalizeMedicalRecord(record.id).subscribe({
      next: response => {
        this.selectedRecord.set(response.data);
        this.saving.set(false);
        this.successMessage.set('Medical record finalized successfully.');
        this.loadPageData();
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to finalize medical record.'));
      }
    });
  }

  closeForms(): void {
    this.showRecordForm.set(false);
    this.showVitalsForm.set(false);
    this.editingRecordId.set(null);
    this.resetRecordForm();
  }

  closeDetails(): void {
    this.showDetails.set(false);
    this.selectedRecord.set(null);
    this.vitals.set([]);
    this.showLabOrderForm.set(false);
    this.createdLabOrder.set(null);
  }

  resetRecordForm(): void {
    this.recordForm = {
      appointmentId: '',
      diagnosis: '',
      symptoms: '',
      clinicalNotes: '',
      treatmentPlan: ''
    };
  }

  getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    return error.error?.error?.message || error.error?.message || fallback;
  }

  trackByAppointmentId(index: number, item: DoctorAppointment): string {
    return item.id;
  }

  trackByRecordId(index: number, item: MedicalRecord): string {
    return item.id;
  }

  openLabOrderForm(): void {
    const record = this.selectedRecord();

    if (!record || record.status !== 'FINALIZED') {
      return;
    }

    this.showLabOrderForm.set(true);
    this.createdLabOrder.set(null);
    this.selectedLabTestId = '';
    this.labOrderNotes = '';
    this.errorMessage.set('');

    this.loadActiveLabTests();
  }

  loadActiveLabTests(): void {
    this.loadingLabTests.set(true);
    this.errorMessage.set('');

    this.laboratoryService.getLabTests().subscribe({
      next: response => {
        this.labTests.set(
          (response.data || []).filter(test => test.isActive)
        );
        this.loadingLabTests.set(false);
      },
      error: error => {
        this.loadingLabTests.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to load laboratory tests.')
        );
      }
    });
  }

  createLabOrder(): void {
    const record = this.selectedRecord();

    if (!record || record.status !== 'FINALIZED') {
      this.errorMessage.set('Only finalized medical records can have laboratory orders.');
      return;
    }

    if (!this.selectedLabTestId) {
      this.errorMessage.set('Please select a laboratory test.');
      return;
    }

    const payload: CreateLaboratoryOrder = {
      medicalRecordId: record.id,
      labTestId: this.selectedLabTestId,
      ...(this.labOrderNotes.trim()
        ? { notes: this.labOrderNotes.trim() }
        : {})
    };

    this.labOrderSaving.set(true);
    this.errorMessage.set('');

    this.laboratoryService.createLabOrder(payload).subscribe({
      next: response => {
        this.labOrderSaving.set(false);
        this.showLabOrderForm.set(false);
        this.createdLabOrder.set(response.data);
        this.loadLabOrders();
        this.successMessage.set('Laboratory order created successfully.');
        this.selectedLabTestId = '';
        this.labOrderNotes = '';
      },
      error: error => {
        this.labOrderSaving.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to create laboratory order.')
        );
      }
    });
  }

  closeLabOrderForm(): void {
    this.showLabOrderForm.set(false);
    this.selectedLabTestId = '';
    this.labOrderNotes = '';
  }

  loadLabOrders(): void {
    this.laboratoryService.getLabOrders().subscribe({
      next: response => {
        this.labOrders.set(response.data || []);
      },
      error: error => {
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to load laboratory orders.')
        );
      }
    });
  }

  getLabOrdersForRecord(recordId: string): LaboratoryOrder[] {
    return this.labOrders().filter(
      order => order.medicalRecordId === recordId
    );
  }

  approveLabOrder(order: LaboratoryOrder): void {
    if (order.status !== 'RESULT_UPLOADED') {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to approve this laboratory result?'
    );

    if (!confirmed) {
      return;
    }

    const payload: ApproveLabResult = {
      ...(this.approvalNotes[order.id]?.trim()
        ? { approvalNotes: this.approvalNotes[order.id].trim() }
        : {})
    };

    this.approvingOrderId.set(order.id);
    this.errorMessage.set('');

    this.laboratoryService.approveLabResult(order.id, payload).subscribe({
      next: response => {
        this.labOrders.update(orders =>
          orders.map(item =>
            item.id === order.id
              ? {
                  ...item,
                  ...response.data,
                  labTest: item.labTest,
                  medicalRecord: item.medicalRecord
                }
              : item
          )
        );

        this.approvingOrderId.set(null);
        this.loadLabOrders();
        this.successMessage.set('Laboratory result approved successfully.');
      },
      error: error => {
        this.approvingOrderId.set(null);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to approve laboratory result.')
        );
      }
    });
  }
}
