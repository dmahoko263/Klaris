import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-batch-qr',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './batch-qr.html',
  styleUrl: './batch-qr.css',
})
export class BatchQr {
  @Input({ required: true }) batchId!: number | string;
  @Input() compact = false;

  get qrValue(): string {
    if (!this.batchId) return '';
    return `${window.location.origin}/verify/${this.batchId}`;
  }
}