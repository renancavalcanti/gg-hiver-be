import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { ApiResponse, TaskItem } from './models';

interface TaskPayload {
  title?: string;
  description?: string;
  done?: boolean;
  priority?: 'low' | 'medium' | 'high';
  assignedUserId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  getTasks() {
    return this.http.get<ApiResponse<{ tasks: TaskItem[] }>>(`${environment.apiUrl}/tasks`);
  }

  createTask(payload: TaskPayload) {
    return this.http.post<ApiResponse<{ task: TaskItem }>>(`${environment.apiUrl}/tasks`, payload);
  }

  updateTask(taskId: string, payload: TaskPayload) {
    return this.http.patch<ApiResponse<{ task: TaskItem }>>(
      `${environment.apiUrl}/tasks/${taskId}`,
      payload,
    );
  }

  deleteTask(taskId: string) {
    return this.http.delete<ApiResponse<{ task: TaskItem }>>(`${environment.apiUrl}/tasks/${taskId}`);
  }
}
