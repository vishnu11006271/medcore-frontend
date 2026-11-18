import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MyAppointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.scss'
})
export class AppointmentDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);

  appointment = signal<MyAppointment | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');

    if (!appointmentId) {
      this.errorMessage.set('Invalid appointment ID.');
      this.isLoading.set(false);
      return;
    }

    this.loadAppointment(appointmentId);
  }

  loadAppointment(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.error?.message ||
          'Unable to load appointment details.'
        );
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient/my-appointments']);
  }

  cancelAppointment(): void {
    const item = this.appointment();

    if (!item || !confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.isLoading.set(true);

    this.appointmentService.cancelAppointment(item.id).subscribe({
      next: () => {
        this.appointment.update(current =>
          current ? { ...current, status: 'CANCELLED' } : null
        );

        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.error?.message || 'Unable to cancel appointment.'
        );
        this.isLoading.set(false);
      }
    });
  }
}