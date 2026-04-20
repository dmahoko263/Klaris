import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-scan-batch',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './scan-batch.html',
  styleUrl: './scan-batch.css',
})
export class ScanBatch {
  private router = inject(Router);

  formats = [BarcodeFormat.QR_CODE];

  hasPermission = signal<boolean | null>(null);
  scannedText = signal('');
  error = signal('');

  loading = signal(false);
  scanned = signal(false);

  devices = signal<MediaDeviceInfo[]>([]);
  currentDevice = signal<MediaDeviceInfo | undefined>(undefined);

  torchAvailable = signal(false);
  torchEnabled = signal(false);

  onPermissionResponse(hasPermission: boolean) {
    this.hasPermission.set(hasPermission);
    if (!hasPermission) {
      this.error.set('Camera permission denied.');
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.devices.set(devices);

    const backCamera =
      devices.find((d) =>
        /back|rear|environment/gi.test(`${d.label} ${d.deviceId}`)
      ) || devices[0];

    this.currentDevice.set(backCamera);
  }

  onTorchCompatible(isCompatible: boolean) {
    this.torchAvailable.set(isCompatible);
  }

  async onScanSuccess(result: string) {
    if (this.scanned()) return;

    this.scanned.set(true);
    this.scannedText.set(result);
    this.error.set('');

    const batchId = this.extractBatchId(result);

    if (!batchId) {
      this.error.set('Invalid QR Code');
      this.scanned.set(false);
      return;
    }

    this.playBeep();
    this.vibrate();

    this.loading.set(true);

    // Smooth UX delay
    await new Promise((r) => setTimeout(r, 600));

    await this.router.navigate(['/dashboard/verify', batchId]);
  }
  
  onScanError(err: unknown) {
    console.error(err);
    this.error.set('Scan failed. Try again.');
  }

  retry() {
    this.error.set('');
    this.scanned.set(false);
    this.loading.set(false);
  }

  toggleTorch() {
    if (!this.torchAvailable()) return;
    this.torchEnabled.update((v) => !v);
  }

  private extractBatchId(value: string): string | null {
    const trimmed = value.trim();

    if (/^\d+$/.test(trimmed)) return trimmed;

    const match =
      trimmed.match(/\/verify\/([^/?#]+)/i) ||
      trimmed.match(/\/verify\/([^/?#]+)/i) ||
      trimmed.match(/batchId=([^&]+)/i);

    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }

  private playBeep() {
    const audio = new Audio('/assets/beep.mp3');
    audio.play().catch(() => {});
  }

  private vibrate() {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }
}