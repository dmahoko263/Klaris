import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaWeb3Service } from '../../core/services/pharma-web3.service';

@Component({
  selector: 'app-mark-delivered',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mark-delivered.html',
  styleUrl: './mark-delivered.css',
})
export class MarkDelivered {
  private fb = inject(FormBuilder);
  private pharmaWeb3 = inject(PharmaWeb3Service);

  loading = signal(false);
  result = signal<any | null>(null);
  error = signal('');
  successMessage = signal('');

  hasSuccess = computed(() => !!this.successMessage());

  form = this.fb.group({
    batchId: ['', [Validators.required]],
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

    const batchId = Number(this.form.getRawValue().batchId);

    if (!batchId || Number.isNaN(batchId)) {
      this.error.set('A valid batch ID is required.');
      return;
    }

    this.loading.set(true);

    this.pharmaWeb3
      .markDelivered(batchId)
      .then((res) => {
        this.result.set(res);
        this.successMessage.set('Batch marked as delivered successfully.');
        this.form.reset({ batchId: '' });
        this.loading.set(false);
      })
      .catch((err: any) => {
        console.error(err);
        this.error.set(
          err?.shortMessage ||
            err?.reason ||
            err?.message ||
            'Failed to mark batch as delivered with MetaMask'
        );
        this.loading.set(false);
      });
  }
}