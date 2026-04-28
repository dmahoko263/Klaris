import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaService } from '../../core/services/pharma.service';

@Component({
  selector: 'app-ownership-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ownership-history.html',
  styleUrl: './ownership-history.css',
})
export class OwnershipHistory {
  private fb = inject(FormBuilder);
  private pharma = inject(PharmaService);

  loading = signal(false);
  error = signal('');
  entries = signal<any[]>([]);
  searchedBatchId = signal<string>('');

  hasEntries = computed(() => this.entries().length > 0);

  form = this.fb.group({
    batchId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
  });

  get f() {
    return this.form.controls;
  }

  load() {
    this.error.set('');
    this.entries.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const batchId = String(this.form.getRawValue().batchId || '').trim();

    if (!batchId) {
      this.error.set('Batch ID is required.');
      return;
    }

    this.loading.set(true);
    this.searchedBatchId.set(batchId);

    this.pharma.getOwnershipHistory(batchId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res)
          ? res
          : res?.history || res?.entries || [];

        this.entries.set(list);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('OWNERSHIP_HISTORY_ERROR:', err);
        this.error.set(
          err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            'Failed to load ownership history'
        );
        this.loading.set(false);
      },
    });
  }

  reset() {
    this.form.reset({ batchId: '' });
    this.entries.set([]);
    this.error.set('');
    this.loading.set(false);
    this.searchedBatchId.set('');
  }

  shortAddress(addr?: string): string {
    if (!addr) return '—';
    return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  }

  fullAddressLabel(addr?: string): string {
    if (!addr) return '—';
    if (this.isZeroAddress(addr)) return 'Genesis / Initial Owner';
    return addr;
  }

  formatDate(unix?: number | string): string {
    const value = Number(unix);
    if (!value) return '—';
    return new Date(value * 1000).toLocaleString();
  }

  isZeroAddress(addr?: string): boolean {
    return (
      !!addr &&
      addr.toLowerCase() === '0x0000000000000000000000000000000000000000'
    );
  }

  copyText(value?: string) {
    if (!value) return;
    navigator.clipboard.writeText(value).catch((err) => {
      console.error('COPY_ERROR:', err);
    });
  }
shortBatchId(id?: string | number): string {
  if (id === undefined || id === null) {
    return '—';
  }

  const value = String(id).trim();

  if (!value) {
    return '—';
  }

  return value.length > 5
    ? `${value.slice(0, 5)}...`
    : value;
}

}