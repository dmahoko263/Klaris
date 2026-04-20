import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-batch-label',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './batch-label.html',
  styleUrl: './batch-label.css',
})
export class BatchLabel {
  @Input() batch: any;

  get qrValue(): string {
    return `http://localhost:4200/dashboard/verify/${this.batch?.batchId}`;
  }

  formatDate(unix: number) {
    return new Date(unix * 1000).toLocaleDateString();
  }

  print() {
    window.print();
  }
}