import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaWeb3Service } from '../../core/services/pharma-web3.service';

@Component({
  selector: 'app-transfer-batch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-batch.html',
  styleUrl: './transfer-batch.css',
})
export class TransferBatch {
  private fb = inject(FormBuilder);
  private pharmaWeb3 = inject(PharmaWeb3Service);

  loading = signal(false);
  result = signal<any | null>(null);
  error = signal('');
  successMessage = signal('');

  hasSuccess = computed(() => !!this.successMessage());

  form = this.fb.group({
    batchId: ['', [Validators.required]],
    newOwner: ['', [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)]],
    note: ['Transferred by supply chain operator'],
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
    const payload = {
      batchId: Number(raw.batchId),
      newOwner: String(raw.newOwner || '').trim(),
      note: String(raw.note || '').trim(),
    };

    this.loading.set(true);

    this.pharmaWeb3
      .transferOwnership(payload)
      .then((res) => {
        this.result.set(res);
        this.successMessage.set('Batch ownership transferred successfully.');
        this.form.reset({
          batchId: '',
          newOwner: '',
          note: 'Transferred by supply chain operator',
        });
        this.loading.set(false);
      })
      .catch((err: any) => {
        console.error(err);
        this.error.set(
          err?.shortMessage ||
          err?.reason ||
          err?.message ||
          'Failed to transfer ownership with MetaMask'
        );
        this.loading.set(false);
      });
  }
}