import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaService } from '../../core/services/pharma.service';

@Component({
  selector: 'app-verify-batch',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-batch.html',
  styleUrl: './verify-batch.css',
})
export class VerifyBatch {
  private fb = inject(FormBuilder);
  private pharma = inject(PharmaService);

  result: any = null;
  error = '';
  loading = false;

  form = this.fb.group({
    batchId: ['', [Validators.required]],
  });

  verify() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const batchId = this.form.getRawValue().batchId!;
    this.loading = true;
    this.result = null;
    this.error = '';

    this.pharma.verifyBatch(batchId).subscribe({
      next: (res) => (this.result = res),
      error: (err) => {
        this.error = err?.error?.error || 'Verification failed';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}