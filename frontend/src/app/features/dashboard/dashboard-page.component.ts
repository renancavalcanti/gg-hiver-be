import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../core/auth.service';
import { TaskItem, UserProfile } from '../../core/models';
import { TaskService } from '../../core/task.service';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly tasks = signal<TaskItem[]>([]);
  readonly users = signal<UserProfile[]>([]);
  readonly pageError = signal('');
  readonly isLoading = signal(true);
  readonly isSavingTask = signal(false);
  readonly editingTaskId = signal<string | null>(null);

  readonly taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as 'low' | 'medium' | 'high'],
    assignedUserId: [''],
    done: [false],
  });

  constructor() {
    this.loadDashboard();
  }

  get isEditing(): boolean {
    return Boolean(this.editingTaskId());
  }

  trackByTask(_: number, task: TaskItem): string {
    return task._id;
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.pageError.set('');

    forkJoin({
      me: this.authService.fetchMe(),
      tasks: this.taskService.getTasks(),
      users: this.userService.getUsers(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ tasks, users }) => {
          this.tasks.set(tasks.data.tasks);
          this.users.set(users.data.users);
        },
        error: (error) => {
          this.pageError.set(error.error?.message ?? 'Could not load the dashboard.');
        },
      });
  }

  submitTask(): void {
    const currentUser = this.currentUser();
    if (!currentUser) {
      return;
    }

    const editingTask = this.tasks().find((task) => task._id === this.editingTaskId());
    const isOwner = editingTask ? editingTask.userId._id === currentUser.id : true;

    if (!editingTask && this.taskForm.controls.title.invalid) {
      this.taskForm.controls.title.markAsTouched();
      return;
    }

    const payload = editingTask && !isOwner
      ? { done: this.taskForm.controls.done.getRawValue() }
      : {
          title: this.taskForm.controls.title.getRawValue(),
          description: this.taskForm.controls.description.getRawValue(),
          priority: this.taskForm.controls.priority.getRawValue(),
          assignedUserId: this.taskForm.controls.assignedUserId.getRawValue() || null,
          done: this.taskForm.controls.done.getRawValue(),
        };

    this.isSavingTask.set(true);

    const request$ = editingTask
      ? this.taskService.updateTask(editingTask._id, payload)
      : this.taskService.createTask(payload);

    request$.pipe(finalize(() => this.isSavingTask.set(false))).subscribe({
      next: () => {
        this.resetForm();
        this.refreshTasks();
      },
      error: (error) => {
        this.pageError.set(error.error?.message ?? 'Could not save the task.');
      },
    });
  }

  editTask(task: TaskItem): void {
    this.editingTaskId.set(task._id);
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedUserId: task.assignedUserId?._id ?? '',
      done: task.done,
    });
  }

  toggleTask(task: TaskItem): void {
    this.taskService.updateTask(task._id, { done: !task.done }).subscribe({
      next: () => this.refreshTasks(),
      error: (error) => {
        this.pageError.set(error.error?.message ?? 'Could not update the status.');
      },
    });
  }

  deleteTask(task: TaskItem): void {
    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        if (this.editingTaskId() === task._id) {
          this.resetForm();
        }
        this.refreshTasks();
      },
      error: (error) => {
        this.pageError.set(error.error?.message ?? 'Could not remove the task.');
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  resetForm(): void {
    this.editingTaskId.set(null);
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      assignedUserId: '',
      done: false,
    });
  }

  isOwner(task: TaskItem): boolean {
    return task.userId._id === this.currentUser()?.id;
  }

  private refreshTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (response) => {
        this.tasks.set(response.data.tasks);
      },
      error: (error) => {
        this.pageError.set(error.error?.message ?? 'Could not reload the tasks.');
      },
    });
  }
}
