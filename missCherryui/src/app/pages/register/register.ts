import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../core/services/wallet.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  wallet = inject(WalletService);

  loading = false;
  walletLoading = false;
  error = '';
  success = '';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['patient', Validators.required],
    walletAddress: [''],
    organizationName: [''],
    address: [''],
    country: [''],
    website: [''],
    phone: [''],
  });

  get f() {
    return this.form.controls;
  }

  get isOrganizationRole(): boolean {
    const role = this.form.get('role')?.value;
    return (
      role === 'manufacturer' ||
      role === 'distributor' ||
      role === 'pharmacy'
    );
  }

  async connectMetaMask() {
    this.error = '';
    this.walletLoading = true;

    try {
      await this.wallet.switchToHardhat();
      const address = await this.wallet.connectWallet();

      this.form.patchValue({
        walletAddress: address,
      });
    } catch (err: any) {
      console.error(err);
      this.error = err?.message || 'Failed to connect MetaMask';
    } finally {
      this.walletLoading = false;
    }
  }

  submit() {
    this.error = '';
    this.success = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      (raw.role === 'manufacturer' ||
        raw.role === 'distributor' ||
        raw.role === 'pharmacy') &&
      (!raw.organizationName ||
        !raw.address ||
        !raw.country ||
        !raw.phone ||
        !raw.walletAddress)
    ) {
      this.error =
        'Organization name, address, country, phone, and wallet address are required for this role';
      return;
    }

    this.loading = true;

    this.auth.register(raw as any).subscribe({
      next: () => {
        this.success = 'Account created successfully';

        this.form.reset({
          fullName: '',
          email: '',
          password: '',
          role: 'patient',
          walletAddress: '',
          organizationName: '',
          address: '',
          country: '',
          website: '',
          phone: '',
        });

        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Registration failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}