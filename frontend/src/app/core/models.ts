export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
}

export interface TaskItem {
  _id: string;
  title: string;
  description: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  userId: UserSummary;
  assignedUserId: UserSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
