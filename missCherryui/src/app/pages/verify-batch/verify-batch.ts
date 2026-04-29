import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmaService } from '../../core/services/pharma.service';

@Component({
  selector: 'app-verify-batch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './verify-batch.html',
  styleUrl: './verify-batch.css',
})
export class VerifyBatch implements OnInit {
  private fb = inject(FormBuilder);
  private pharma = inject(PharmaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  result = signal<any | null>(null);
  error = signal('');
  loading = signal(false);
  autoTriggered = signal(false);

  form = this.fb.group({
    batchId: ['', [Validators.required]],
    note: ['Verified automatically from UI / QR'],
  });

  isVerified = computed(() => !!this.result()?.ok && !!this.result()?.valid);
  verifyReason = computed(() => this.result()?.reason || '');
  verificationCount = computed(() =>
    Number(this.result()?.verificationCount ?? 0)
  );

  statusText = computed(() => {
    const status = Number(this.result()?.status ?? 0);

    switch (status) {
      case 0:
        return 'Registered';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      case 3:
        return 'Recalled';
      default:
        return 'Unknown';
    }
  });

  ngOnInit(): void {
    const rawBatchId =
      this.route.snapshot.paramMap.get('batchId') ||
      this.route.snapshot.paramMap.get('id');

    if (rawBatchId) {
      const batchId = rawBatchId.trim();

      this.form.patchValue({ batchId });
      this.autoTriggered.set(true);

      setTimeout(() => {
        this.verify();
      }, 250);
    }
  }

  get f() {
    return this.form.controls;
  }

  trimBatchId() {
    const control = this.form.get('batchId');

    if (control?.value) {
      control.setValue(String(control.value).trim());
    }
  }

  verify() {
    this.error.set('');
    this.result.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const batchId = String(this.form.getRawValue().batchId || '').trim();

    if (!batchId) {
      this.error.set('Batch ID is required.');
      return;
    }

    if (/e\+|e-/i.test(batchId)) {
      this.error.set(
        'Invalid batch ID. Please scan the QR code again or paste the full batch ID.'
      );
      return;
    }

    if (!/^\d+$/.test(batchId)) {
      this.error.set('Invalid batch ID. Batch ID must contain digits only.');
      return;
    }

    this.loading.set(true);

    this.pharma.verifyBatch(batchId).subscribe({
      next: (verifyRes: any) => {
        this.result.set(verifyRes);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('VERIFY_ERROR:', err);

        this.error.set(
          err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            'Verification failed'
        );

        this.loading.set(false);
      },
    });
  }

  reset() {
    this.form.reset({
      batchId: '',
      note: 'Verified automatically from UI / QR',
    });

    this.result.set(null);
    this.error.set('');
    this.loading.set(false);
    this.autoTriggered.set(false);

    this.router.navigate(['/verify']);
  }

  formatDate(unix?: number | string): string {
    const value = Number(unix);
    return value ? new Date(value * 1000).toLocaleDateString() : '—';
  }

  shortAddress(addr?: string): string {
    if (!addr) return '—';
    return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  }

  copyText(value?: string) {
    if (!value) return;

    navigator.clipboard.writeText(value).catch((err) => {
      console.error('Copy failed:', err);
    });
  }

  shortBatchId(id?: string | number | null): string {
    if (id === undefined || id === null) {
      return '—';
    }

    const value = String(id).trim();

    if (!value) {
      return '—';
    }

    return value.length > 5 ? `${value.slice(0, 5)}...` : value;
  }
}