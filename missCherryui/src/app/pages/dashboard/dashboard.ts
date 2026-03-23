import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PharmaService } from '../../core/services/pharma.service';
import { CommonModule } from '@angular/common';

/** Mirrors the Solidity BatchStatus enum (0-3) */
export enum BatchStatus {
  Registered = 0,
  InTransit   = 1,
  Delivered   = 2,
  Recalled    = 3,
}

/** Mirrors the Solidity Batch struct exactly */
export interface Batch {
  batchId:             number | string;
  drugName:            string;
  manufacturerName:    string;
  manufactureDate:     number;   // unix timestamp
  expiryDate:          number;   // unix timestamp
  metadataURI:         string;
  manufacturer:        string;   // address
  currentOwner:        string;   // address
  status:              BatchStatus;
  exists:              boolean;
  suspicious:          boolean;
  verificationCount:   number;
  uniqueVerifierCount: number;
  createdAt:           number;   // unix timestamp
}

/** Mirrors the Solidity OwnershipRecord struct */
export interface OwnershipRecord {
  from:      string;
  to:        string;
  timestamp: number;
  note:      string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  auth   = inject(AuthService);
  pharma = inject(PharmaService);

  // ── Role gates ──────────────────────────────
  role             = computed(() => this.auth.currentUser()?.role);
  isManufacturer   = computed(() => this.role() === 'manufacturer');
  isAdmin          = computed(() => this.role() === 'admin');
  isPrivileged     = computed(() => this.isAdmin() || this.isManufacturer());

  // ── Data signals ────────────────────────────
  batches        = signal<Batch[]>([]);
  loadingBatches = signal(false);
  batchesError   = signal('');

  // ── Manufacturer computed stats ─────────────
  totalBatches      = computed(() => this.batches().length);

  registeredBatches = computed(() =>
    this.batches().filter(b => b.status === BatchStatus.Registered).length);

  inTransitBatches  = computed(() =>
    this.batches().filter(b => b.status === BatchStatus.InTransit).length);

  deliveredBatches  = computed(() =>
    this.batches().filter(b => b.status === BatchStatus.Delivered).length);

  recalledBatches   = computed(() =>
    this.batches().filter(b => b.status === BatchStatus.Recalled).length);

  suspiciousBatches = computed(() =>
    this.batches().filter(b => b.suspicious).length);

  expiredBatches    = computed(() =>
    this.batches().filter(b => this.isExpired(b)).length);

  totalVerifications = computed(() =>
    this.batches().reduce((sum, b) => sum + (b.verificationCount ?? 0), 0));

  // ── Admin stat signals (wired from API later) ─
  totalUsers    = signal<number>(0);
  totalWallets  = signal<number>(0);
  pendingRoles  = signal<number>(0);

  // BatchStatus enum exposed to template
  readonly BatchStatus = BatchStatus;

  ngOnInit() {
    if (this.isManufacturer()) {
      this.loadBatches();
    }
  }

  private loadBatches() {
    this.loadingBatches.set(true);
    this.batchesError.set('');

    this.pharma.getAllBatches().subscribe({
      next: (data: Batch[]) => {
        this.batches.set(data);
        this.loadingBatches.set(false);
      },
      error: (err: any) => {
        this.batchesError.set(err?.error?.error || 'Failed to load blockchain data');
        this.loadingBatches.set(false);
      }
    });
  }

  refresh() { this.loadBatches(); }

  // ── Helpers ──────────────────────────────────
  isExpired(batch: Batch): boolean {
    return Date.now() / 1000 > batch.expiryDate;
  }

  formatDate(unix: number): string {
    if (!unix) return '—';
    return new Date(unix * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  shortAddress(addr: string): string {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return '—';
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  statusLabel(status: BatchStatus): string {
    return BatchStatus[status] ?? 'Unknown';
  }

  statusClass(batch: Batch): string {
    if (batch.status === BatchStatus.Recalled)   return 'badge-recalled';
    if (batch.suspicious)                         return 'badge-suspicious';
    if (this.isExpired(batch))                    return 'badge-expired';
    const map: Record<number, string> = {
      [BatchStatus.Registered]: 'badge-registered',
      [BatchStatus.InTransit]:  'badge-transit',
      [BatchStatus.Delivered]:  'badge-delivered',
    };
    return map[batch.status] ?? 'badge-default';
  }

  statusDisplayLabel(batch: Batch): string {
    if (batch.status === BatchStatus.Recalled) return 'Recalled';
    if (batch.suspicious)                       return 'Suspicious';
    if (this.isExpired(batch))                  return 'Expired';
    return this.statusLabel(batch.status);
  }
}