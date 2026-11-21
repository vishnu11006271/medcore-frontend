export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListData {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
