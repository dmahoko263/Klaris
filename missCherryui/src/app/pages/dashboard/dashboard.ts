import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PharmaService, BatchRecord } from '../../core/services/pharma.service';
import { WalletService } from '../../core/services/wallet.service';

/** Mirrors the Solidity BatchStatus enum (0-3) */
export enum BatchStatus {
  Registered = 0,
  InTransit = 1,
  Delivered = 2,
  Recalled = 3,
}

/** Dashboard batch model */
export interface Batch {
  batchId: number | string;
  drugName: string;
  manufacturerName: string;
  manufactureDate: number;
  expiryDate: number;
  metadataURI: string;
  manufacturer: string;
  currentOwner: string;
  status: BatchStatus;
  exists: boolean;
  suspicious: boolean;
  verificationCount: number;
  uniqueVerifierCount: number;
  createdAt: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  auth = inject(AuthService);
  pharma = inject(PharmaService);
  wallet = inject(WalletService);

  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  role = computed(() => this.auth.currentUser()?.role);
  isManufacturer = computed(() => this.role() === 'manufacturer');
  isAdmin = computed(() => this.role() === 'admin');
  isPrivileged = computed(() => this.isAdmin() || this.isManufacturer());

  batches = signal<Batch[]>([]);
  loadingBatches = signal(false);
  batchesError = signal('');

  walletLoading = signal(false);
  walletError = signal('');

  totalBatches = computed(() => this.batches().length);

  registeredBatches = computed(() =>
    this.batches().filter((b) => b.status === BatchStatus.Registered).length
  );

  inTransitBatches = computed(() =>
    this.batches().filter((b) => b.status === BatchStatus.InTransit).length
  );

  deliveredBatches = computed(() =>
    this.batches().filter((b) => b.status === BatchStatus.Delivered).length
  );

  recalledBatches = computed(() =>
    this.batches().filter((b) => b.status === BatchStatus.Recalled).length
  );

  suspiciousBatches = computed(() =>
    this.batches().filter((b) => b.suspicious).length
  );

  expiredBatches = computed(() =>
    this.batches().filter((b) => this.isExpired(b)).length
  );

  totalVerifications = computed(() =>
    this.batches().reduce((sum, b) => sum + (b.verificationCount ?? 0), 0)
  );

  totalUniqueVerifiers = computed(() =>
    this.batches().reduce((sum, b) => sum + (b.uniqueVerifierCount ?? 0), 0)
  );

  readonly BatchStatus = BatchStatus;

  ngOnInit() {
    if (this.isManufacturer() || this.isAdmin()) {
      this.loadBatches();

      this.refreshIntervalId = setInterval(() => {
        this.loadBatches(false);
      }, 10000);
    }
  }

  ngOnDestroy() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  private loadBatches(showLoader = true) {
    if (showLoader || this.batches().length === 0) {
      this.loadingBatches.set(true);
    }

    this.batchesError.set('');

    this.pharma.getAllBatches().subscribe({
      next: (data: BatchRecord[]) => {
        const mapped: Batch[] = data.map((item) => ({
          batchId: item.batchId,
          drugName: item.drugName,
          manufacturerName: item.manufacturerName,
          manufactureDate: Number(item.manufactureDate ?? 0),
          expiryDate: Number(item.expiryDate ?? 0),
          metadataURI: item.metadataURI ?? '',
          manufacturer: item.manufacturerName ?? '',
          currentOwner: item.currentOwner ?? '',
          status: this.mapStatus(item.status),
          exists: true,
          suspicious: Boolean(item.isSuspicious ?? false),
          verificationCount: Number(item.verificationCount ?? 0),
          uniqueVerifierCount: Number(item.uniqueVerifierCount ?? 0),
          createdAt: Number(item.createdAt ?? item.manufactureDate ?? 0),
        }));

        this.batches.set(mapped);
        this.loadingBatches.set(false);
      },
      error: (err: any) => {
        this.batchesError.set(
          err?.error?.error ||
            err?.error?.message ||
            'Failed to load blockchain data'
        );
        this.loadingBatches.set(false);
      },
    });
  }

  refresh() {
    this.loadBatches(true);
  }

  async connectMetaMask() {
    this.walletError.set('');
    this.walletLoading.set(true);

    try {
      await this.wallet.switchToHardhat();
      await this.wallet.connectWallet();
    } catch (err: any) {
      console.error(err);
      this.walletError.set(err?.message || 'Failed to connect MetaMask');
    } finally {
      this.walletLoading.set(false);
    }
  }

  private mapStatus(status: unknown): BatchStatus {
    if (typeof status === 'number') {
      switch (status) {
        case 0:
          return BatchStatus.Registered;
        case 1:
          return BatchStatus.InTransit;
        case 2:
          return BatchStatus.Delivered;
        case 3:
          return BatchStatus.Recalled;
      }
    }

    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case '0':
        case 'registered':
          return BatchStatus.Registered;

        case '1':
        case 'intransit':
        case 'in_transit':
        case 'in transit':
          return BatchStatus.InTransit;

        case '2':
        case 'delivered':
          return BatchStatus.Delivered;

        case '3':
        case 'recalled':
          return BatchStatus.Recalled;
      }
    }

    return BatchStatus.Registered;
  }

  isExpired(batch: Batch): boolean {
    return !!batch.expiryDate && Date.now() / 1000 > batch.expiryDate;
  }

  formatDate(unix: number): string {
    if (!unix) return '—';

    return new Date(unix * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  shortAddress(addr: string): string {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') {
      return '—';
    }

    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  statusLabel(status: BatchStatus): string {
    switch (status) {
      case BatchStatus.Registered:
        return 'Registered';
      case BatchStatus.InTransit:
        return 'In Transit';
      case BatchStatus.Delivered:
        return 'Delivered';
      case BatchStatus.Recalled:
        return 'Recalled';
      default:
        return 'Unknown';
    }
  }

  statusClass(batch: Batch): string {
    if (batch.status === BatchStatus.Recalled) return 'badge-recalled';
    if (batch.suspicious) return 'badge-suspicious';
    if (this.isExpired(batch)) return 'badge-expired';

    const map: Record<number, string> = {
      [BatchStatus.Registered]: 'badge-registered',
      [BatchStatus.InTransit]: 'badge-transit',
      [BatchStatus.Delivered]: 'badge-delivered',
    };

    return map[batch.status] ?? 'badge-default';
  }
copyWalletAddress() {
  const account = this.wallet.account();
  if (!account) return;

  navigator.clipboard.writeText(account).catch((err) => {
    console.error('Failed to copy wallet address:', err);
  });
}
  statusDisplayLabel(batch: Batch): string {
    if (batch.status === BatchStatus.Recalled) return 'Recalled';
    if (batch.suspicious) return 'Suspicious';
    if (this.isExpired(batch)) return 'Expired';
    return this.statusLabel(batch.status);
  }
}