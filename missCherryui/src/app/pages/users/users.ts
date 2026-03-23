import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { UserService } from '../../core/services/users/user.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users = signal<any[]>([]);
  loading = signal(false);
  editingUser = signal<any | null>(null);
  error = signal('');
  success = signal('');

  walletForm = this.fb.group({
    walletAddress: ['', [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)]],
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  startEdit(user: any) {
    this.editingUser.set(user);
    this.walletForm.patchValue({ walletAddress: user.walletAddress || '' });
    this.error.set('');
    this.success.set('');
  }

  cancelEdit() {
    this.editingUser.set(null);
    this.walletForm.reset();
  }

  saveWallet() {
    if (this.walletForm.invalid) {
      this.walletForm.markAllAsTouched();
      return;
    }

    const { walletAddress } = this.walletForm.getRawValue();
    const user = this.editingUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set('');

    this.userService.updateWallet(user.id, walletAddress!).subscribe({
      next: () => {
        this.success.set(`Wallet updated for ${user.email}`);
        this.editingUser.set(null);
        this.walletForm.reset();
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Failed to update wallet');
        this.loading.set(false);
      },
    });
  }

  toggleActive(user: any) {
    this.userService.toggleActive(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => this.error.set(err?.error?.error || 'Failed to toggle user'),
    });
  }
}