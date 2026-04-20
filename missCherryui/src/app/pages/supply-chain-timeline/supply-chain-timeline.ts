import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaService } from '../../core/services/pharma.service';

type TimelineItemType =
  | 'registered'
  | 'ownership'
  | 'verification'
  | 'delivered'
  | 'recalled'
  | 'flagged';

interface TimelineItem {
  type: TimelineItemType;
  title: string;
  subtitle?: string;
  timestamp?: number;
  badge?: string;
  note?: string;
  actor?: string;
  from?: string;
  to?: string;
  validAtScan?: boolean;
}

@Component({
  selector: 'app-supply-chain-timeline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supply-chain-timeline.html',
  styleUrl: './supply-chain-timeline.css',
})
export class SupplyChainTimeline {
  private fb = inject(FormBuilder);
  private pharma = inject(PharmaService);

  loading = signal(false);
  error = signal('');
  batch = signal<any | null>(null);
  ownershipHistory = signal<any[]>([]);
  verificationHistory = signal<any[]>([]);

  form = this.fb.group({
    batchId: ['', [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  hasBatch = computed(() => !!this.batch());

  timeline = computed<TimelineItem[]>(() => {
    const batch = this.batch();
    if (!batch) return [];

    const items: TimelineItem[] = [];

    items.push({
      type: 'registered',
      title: 'Batch Registered',
      subtitle: `${batch.drugName || 'Medicine'} registered by ${batch.manufacturerName || 'manufacturer'}`,
      timestamp: Number(batch.createdAt || batch.manufactureDate || 0),
      badge: 'Registered',
      actor: batch.manufacturer,
      note: batch.metadataURI ? `Metadata: ${batch.metadataURI}` : undefined,
    });

    for (const item of this.ownershipHistory()) {
      items.push({
        type: 'ownership',
        title: 'Ownership Transferred',
        subtitle: 'Batch moved to next supply-chain actor',
        timestamp: Number(item.timestamp || 0),
        badge: 'Transfer',
        from: item.from,
        to: item.to,
        note: item.note || 'No note',
      });
    }

    for (const item of this.verificationHistory()) {
      items.push({
        type: 'verification',
        title: item.validAtScan ? 'Batch Verified' : 'Failed Verification',
        subtitle: item.validAtScan
          ? 'Authenticity confirmed at scan'
          : 'Verification failed during scan',
        timestamp: Number(item.timestamp || 0),
        badge: item.validAtScan ? 'Verified' : 'Failed',
        actor: item.verifier,
        note: item.note || 'No note',
        validAtScan: !!item.validAtScan,
      });
    }

    const status = Number(batch.status ?? 0);

    if (status === 2) {
      items.push({
        type: 'delivered',
        title: 'Batch Delivered',
        subtitle: 'Batch reached its destination',
        timestamp: Number(batch.createdAt || batch.manufactureDate || 0),
        badge: 'Delivered',
        actor: batch.currentOwner,
      });
    }

    if (status === 3) {
      items.push({
        type: 'recalled',
        title: 'Batch Recalled',
        subtitle: 'Batch was removed from circulation',
        timestamp: Number(batch.createdAt || batch.manufactureDate || 0),
        badge: 'Recalled',
        actor: batch.currentOwner,
      });
    }

    if (batch.suspicious || batch.isSuspicious) {
      items.push({
        type: 'flagged',
        title: 'Suspicious Activity Flagged',
        subtitle: 'Batch exceeded suspicious thresholds',
        timestamp: Number(batch.createdAt || batch.manufactureDate || 0),
        badge: 'Suspicious',
        actor: batch.currentOwner || batch.manufacturer,
      });
    }

    return items.sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  });

  load() {
    this.error.set('');
    this.batch.set(null);
    this.ownershipHistory.set([]);
    this.verificationHistory.set([]);

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

    let batchDone = false;
    let ownershipDone = false;
    let verificationDone = false;
    let failed = false;

    const finish = () => {
      if ((batchDone && ownershipDone && verificationDone) || failed) {
        this.loading.set(false);
      }
    };

    this.pharma.getBatch(batchId).subscribe({
      next: (res: any) => {
        this.batch.set(res);
        batchDone = true;
        finish();
      },
      error: (err: any) => {
        failed = true;
        this.error.set(
          err?.error?.error || err?.error?.message || 'Failed to load batch'
        );
        finish();
      },
    });

    this.pharma.getOwnershipHistory(batchId).subscribe({
      next: (res: any) => {
        const history = Array.isArray(res) ? res : res?.history || res?.entries || [];
        this.ownershipHistory.set(history);
        ownershipDone = true;
        finish();
      },
      error: () => {
        ownershipDone = true;
        finish();
      },
    });

    this.pharma.getVerificationHistory(batchId).subscribe({
      next: (res: any) => {
        const history = Array.isArray(res) ? res : res?.history || res?.entries || [];
        this.verificationHistory.set(history);
        verificationDone = true;
        finish();
      },
      error: () => {
        verificationDone = true;
        finish();
      },
    });
  }

  reset() {
    this.form.reset({ batchId: '' });
    this.error.set('');
    this.batch.set(null);
    this.ownershipHistory.set([]);
    this.verificationHistory.set([]);
    this.loading.set(false);
  }

  shortAddress(addr?: string): string {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') {
      return '—';
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  formatDate(unix?: number | string): string {
    const value = Number(unix || 0);
    if (!value) return '—';
    return new Date(value * 1000).toLocaleString();
  }

  itemBadgeClass(type: TimelineItemType, validAtScan?: boolean): string {
    if (type === 'registered') return 'badge-primary';
    if (type === 'ownership') return 'badge-gold';
    if (type === 'verification' && validAtScan) return 'badge-emerald';
    if (type === 'verification' && !validAtScan) return 'badge-crimson';
    if (type === 'delivered') return 'badge-emerald';
    if (type === 'recalled') return 'badge-crimson';
    if (type === 'flagged') return 'badge-crimson';
    return 'badge-silver';
  }

  itemDotClass(type: TimelineItemType, validAtScan?: boolean): string {
    if (type === 'registered') return 'bg-uzi-500';
    if (type === 'ownership') return 'bg-gold-500';
    if (type === 'verification' && validAtScan) return 'bg-emerald-500';
    if (type === 'verification' && !validAtScan) return 'bg-crimson-500';
    if (type === 'delivered') return 'bg-emerald-500';
    if (type === 'recalled') return 'bg-crimson-500';
    if (type === 'flagged') return 'bg-crimson-500';
    return 'bg-silver-500';
  }
}