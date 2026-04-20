import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmaService } from '../../core/services/pharma.service';

@Component({
  selector: 'app-network-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-activity.html',
  styleUrl: './network-activity.css',
})
export class NetworkActivity implements OnInit {
  private pharma = inject(PharmaService);

  loading = signal(false);
  error = signal('');
  entries = signal<any[]>([]);

  hasEntries = computed(() => this.entries().length > 0);
  totalEntries = computed(() => this.entries().length);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.pharma.getNetworkActivities().subscribe({
      next: (res: any) => {
        this.entries.set(res?.entries || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(
          err?.error?.error ||
          err?.error?.message ||
          'Failed to load activity'
        );
        this.loading.set(false);
      },
    });
  }

  shortHash(value?: string): string {
    if (!value) return '—';
    return value.length > 14
      ? `${value.slice(0, 10)}...${value.slice(-6)}`
      : value;
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'text-emerald-700 bg-emerald-100';
      case 'REVERTED':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-slate-700 bg-slate-100';
    }
  }

  typeClass(type?: string): string {
    switch (type) {
      case 'TX_SUCCESS':
        return 'text-emerald-700 bg-emerald-100';
      case 'TX_REVERTED':
        return 'text-red-700 bg-red-100';
      case 'CALL':
        return 'text-blue-700 bg-blue-100';
      case 'DEPLOY':
        return 'text-violet-700 bg-violet-100';
      case 'NODE_START':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-slate-700 bg-slate-100';
    }
  }
}