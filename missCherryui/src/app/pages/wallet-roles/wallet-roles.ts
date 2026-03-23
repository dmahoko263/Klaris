import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WalletRoleService } from '../../core/services/wallet-role.service';
import { PharmaService } from '../../core/services/pharma.service';
import { switchMap } from 'rxjs';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-wallet-roles',
  imports: [ReactiveFormsModule,TitleCasePipe],
  templateUrl: './wallet-roles.html',
  styleUrl: './wallet-roles.css',
})
export class WalletRoles {
  private fb = inject(FormBuilder);
  private walletRoleService = inject(WalletRoleService);
  private pharma = inject(PharmaService);

  roles: any[] = [];
  error = '';
  loading = false;
  success = '';

  form = this.fb.group({
    walletAddress: ['', [Validators.required]],
    role: ['manufacturer', [Validators.required]],
  });

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.walletRoleService.getAll().subscribe({
      next: (res: any) => {
        this.roles = res.walletRoles ?? [];
      },
    });
  }

 submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.error = '';
  this.success = '';

  const { walletAddress, role } = this.form.getRawValue() as any;
  const blockchainGrant$ = this.getBlockchainGrant(walletAddress, role);

  blockchainGrant$.pipe(
    switchMap((res: any) => {
      // For admin/patient, blockchain step IS the DB save — don't double-save
      if (role === 'admin' || role === 'patient') {
        return [res];
      }
      return this.walletRoleService.createOrUpdate({ walletAddress, role });
    })
  ).subscribe({
    next: () => {
      this.success = `Role "${role}" granted successfully to ${walletAddress}`;
      this.form.reset({ role: 'manufacturer' });
      this.loadRoles();
      this.loading = false;
    },
    error: (err) => {
      // Show the actual backend error message
      this.error = err?.error?.error 
        || err?.error?.message 
        || err?.message 
        || `Failed to grant "${role}" role — server error (500)`;
      this.loading = false;
    }
  });
}
private getBlockchainGrant(address: string, role: string) {
  switch (role) {
    case 'manufacturer': return this.pharma.grantManufacturer(address);
    case 'distributor':  return this.pharma.grantDistributor(address);
    case 'pharmacy':     return this.pharma.grantPharmacy(address);
    default:             return this.walletRoleService.createOrUpdate({ 
                           walletAddress: address, 
                           role: role as 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'patient'
                         });
  }
}
}