import { Component, inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { CherryIcon, Heart, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink,RouterModule,LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
   encapsulation: ViewEncapsulation.None, 
})
export class Login {
    CherryIcon = Heart;
 private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
 theme = inject(ThemeService); 
  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        this.auth.saveSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Login failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}