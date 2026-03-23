import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaService } from '../../core/services/pharma.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {


  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  success = '';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['patient', Validators.required],
    walletAddress: [''],
    organizationName: [''],
    phone: [''],
  });

  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.register(this.form.getRawValue() as any).subscribe({

      next: () => {
        this.success = 'Account created successfully';
        this.form.reset({ role: 'patient' });
this.router.navigate(['/auth/login']);
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },

      error: (err) => {
        this.error = err?.error?.error || 'Registration failed';
        this.loading = false;
      },

      complete: () => {
        this.loading = false;
      }

    });

  }
}