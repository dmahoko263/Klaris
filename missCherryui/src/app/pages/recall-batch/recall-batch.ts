import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaWeb3Service } from '../../core/services/pharma-web3.service';

@Component({
  selector: 'app-recall-batch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recall-batch.html',
  styleUrl: './recall-batch.css',
})
export class RecallBatch {
  private fb = inject(FormBuilder);
  private pharmaWeb3 = inject(PharmaWeb3Service);

  loading = signal(false);
  result = signal<any | null>(null);
  error = signal('');
  successMessage = signal('');

  hasSuccess = computed(() => !!this.successMessage());

  form = this.fb.group({
    batchId: ['', [Validators.required]],
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    this.error.set('');
    this.successMessage.set('');
    this.result.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const batchId = String(raw.batchId || '').trim();
    const reason = String(raw.reason || '').trim();

    if (!batchId || String(batchId).length < 5) {
      this.error.set('A valid batch ID is required.');
      return;
    }

    if (!reason) {
      this.error.set('Recall reason is required.');
      return;
    }

    this.loading.set(true);

    this.pharmaWeb3
      .recallBatch(batchId, reason)
      .then((res) => {
        this.result.set(res);
        this.successMessage.set('Batch recalled successfully.');
        this.form.reset({
          batchId: '',
          reason: '',
        });
        this.loading.set(false);
      })
      .catch((err: any) => {
        console.error(err);
        this.error.set(
          err?.shortMessage ||
            err?.reason ||
            err?.message ||
            'Failed to recall batch with MetaMask'
        );
        this.loading.set(false);
      });
  }
}