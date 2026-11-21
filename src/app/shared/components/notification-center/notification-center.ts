import {
  Component,
  HostListener,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenterComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly notifications = signal<NotificationItem[]>([]);
  readonly unreadCount = signal(0);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly isUpdating = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadNotifications();
  }

  togglePanel(): void {
    const open = !this.isOpen();
    this.isOpen.set(open);

    if (open) {
      this.loadNotifications();
    }
  }

  closePanel(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.notifications.set(response.data.notifications ?? []);
        this.unreadCount.set(response.data.unreadCount ?? 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load notifications. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0 || this.isUpdating()) {
      return;
    }

    this.isUpdating.set(true);
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const readAt = new Date().toISOString();
        this.notifications.update(items =>
          items.map(item => ({ ...item, readAt: item.readAt ?? readAt }))
        );
        this.unreadCount.set(0);
        this.isUpdating.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to update notifications. Please try again.');
        this.isUpdating.set(false);
      }
    });
  }

  openNotification(notification: NotificationItem): void {
    if (notification.readAt) {
      this.navigateToNotification(notification);
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.setNotificationRead(notification.id);
        this.navigateToNotification(notification);
      },
      error: () => {
        this.errorMessage.set('Unable to mark this notification as read.');
      }
    });
  }

  private setNotificationRead(id: string): void {
    let wasUnread = false;
    this.notifications.update(items =>
      items.map(item => {
        if (item.id !== id || item.readAt) {
          return item;
        }

        wasUnread = true;
        return { ...item, readAt: new Date().toISOString() };
      })
    );

    if (wasUnread) {
      this.unreadCount.update(count => Math.max(0, count - 1));
    }
  }

  private navigateToNotification(notification: NotificationItem): void {
    this.closePanel();

    if (notification.linkedEntityType !== 'APPOINTMENT') {
      return;
    }

    const role = this.authService.user()?.role;
    const routeByRole: Record<string, string> = {
      PATIENT: '/dashboard/my-appointments',
      DOCTOR: '/dashboard/doctor-appointments',
      HOSPITAL_ADMIN: '/dashboard/hospital-appointments',
      RECEPTIONIST: '/dashboard/hospital-appointments'
    };

    const route = role ? routeByRole[role] : undefined;
    if (route) {
      void this.router.navigateByUrl(route);
    }
  }
}
