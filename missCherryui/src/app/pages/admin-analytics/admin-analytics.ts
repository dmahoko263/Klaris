import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmaService, BatchRecord } from '../../core/services/pharma.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type UserRole = 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'patient';

interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  isActive?: boolean;
  createdAt?: string;
  fullName?: string;
  organizationName?: string;
}

export enum BatchStatus {
  Registered = 0,
  InTransit = 1,
  Delivered = 2,
  Recalled = 3,
}

interface DashboardBatch {
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
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.css',
})
export class AdminAnalytics implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private pharma = inject(PharmaService);
  auth = inject(AuthService);

  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  loading = signal(false);
  error = signal('');

  users = signal<AdminUser[]>([]);
  batches = signal<DashboardBatch[]>([]);

  currentRole = computed(() => this.auth.currentUser()?.role ?? null);
  isAdmin = computed(() => this.currentRole() === 'admin');

  totalUsers = computed(() => this.users().length);
  activeUsers = computed(() => this.users().filter((u) => u.isActive !== false).length);
  inactiveUsers = computed(() => this.users().filter((u) => u.isActive === false).length);

  manufacturers = computed(() => this.users().filter((u) => u.role === 'manufacturer').length);
  distributors = computed(() => this.users().filter((u) => u.role === 'distributor').length);
  pharmacies = computed(() => this.users().filter((u) => u.role === 'pharmacy').length);
  patients = computed(() => this.users().filter((u) => u.role === 'patient').length);
  admins = computed(() => this.users().filter((u) => u.role === 'admin').length);

  usersWithWallets = computed(() => this.users().filter((u) => !!u.walletAddress).length);

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

  recentUsers = computed(() =>
    [...this.users()]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
  );

  recentBatches = computed(() =>
    [...this.batches()]
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 5)
  );

  readonly BatchStatus = BatchStatus;

  ngOnInit(): void {
    if (!this.isAdmin()) return;

    this.loadAll();

    this.refreshIntervalId = setInterval(() => {
      this.loadAll(false);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  loadAll(showLoader = true) {
    if (showLoader) {
      this.loading.set(true);
    }

    this.error.set('');

    let usersDone = false;
    let batchesDone = false;
    let failed = false;

    const finish = () => {
      if ((usersDone && batchesDone) || failed) {
        this.loading.set(false);
      }
    };

    this.http.get<{ ok: boolean; users: AdminUser[] }>(`${environment.apiUrl}/users`).subscribe({
      next: (res) => {
        this.users.set(res?.users || []);
        usersDone = true;
        finish();
      },
      error: (err: any) => {
        failed = true;
        this.error.set(
          err?.error?.error ||
            err?.error?.message ||
            'Failed to load users analytics'
        );
        finish();
      },
    });

    this.pharma.getAllBatches().subscribe({
      next: (data: BatchRecord[]) => {
        const mapped: DashboardBatch[] = data.map((item) => ({
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
        batchesDone = true;
        finish();
      },
      error: (err: any) => {
        failed = true;
        this.error.set(
          err?.error?.error ||
            err?.error?.message ||
            'Failed to load batch analytics'
        );
        finish();
      },
    });
  }

  refresh() {
    this.loadAll(true);
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

  isExpired(batch: DashboardBatch): boolean {
    return !!batch.expiryDate && Date.now() / 1000 > batch.expiryDate;
  }

  formatDate(unix?: number): string {
    if (!unix) return '—';
    return new Date(unix * 1000).toLocaleDateString();
  }

  formatDateTime(value?: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  }

  shortAddress(addr?: string): string {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return '—';
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
}