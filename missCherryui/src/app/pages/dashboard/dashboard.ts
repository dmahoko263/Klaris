import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PharmaService } from '../../core/services/pharma.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  auth = inject(AuthService);
  pharma = inject(PharmaService);

  isPrivileged = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'manufacturer';
  });

  // Blockchain entries (all batches — no single ID needed for dashboard)
  entries = signal<any[]>([]);
  ledger = signal<any[]>([]);
  loadingEntries = signal(false);
  loadingLedger = signal(false);
  entriesError = signal('');
  ledgerError = signal('');

  // Stats
  totalBatches = computed(() => this.entries().length);
  suspiciousBatches = computed(() => this.entries().filter(e => e.suspicious).length);
  deliveredBatches = computed(() => this.entries().filter(e => e.status === 'delivered').length);

  ngOnInit() {
    if (this.isPrivileged()) {
      this.loadEntries();
    }
  }

 private loadEntries() {
  this.loadingEntries.set(true);
  this.loadingLedger.set(true);
  this.entriesError.set('');

  this.pharma.getAllBatches().subscribe({
    next: (batches) => {
      this.entries.set(batches);
      this.ledger.set(batches);
      this.loadingEntries.set(false);
      this.loadingLedger.set(false);
    },
    error: (err) => {
      this.entriesError.set(err?.error?.error || 'Failed to load chain data');
      this.loadingEntries.set(false);
      this.loadingLedger.set(false);
    }
  });
}
  refresh() {
    this.loadEntries();
  }
}