import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { ApiResponse, UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers() {
    return this.http.get<ApiResponse<{ users: UserProfile[] }>>(`${environment.apiUrl}/auth/users`);
  }
}
