import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaWeb3Service } from '../../core/services/pharma-web3.service';
import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';

type GrantRoleType = 'manufacturer' | 'distributor' | 'pharmacy';

interface HardhatAccountOption {
  label: string;
  address: string;
  suggestedRole?: GrantRoleType;
}

@Component({
  selector: 'app-grant-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './grant-role.html',
  styleUrl: './grant-role.css',
})
export class GrantRole {
  private fb = inject(FormBuilder);
  private pharmaWeb3 = inject(PharmaWeb3Service);
  private wallet = inject(WalletService);
  auth = inject(AuthService);

  loading = signal(false);
  walletLoading = signal(false);
  result = signal<any | null>(null);
  error = signal('');
  successMessage = signal('');

  currentRole = computed(() => this.auth.currentUser()?.role ?? null);
  isAdmin = computed(() => this.currentRole() === 'admin');
  hasSuccess = computed(() => !!this.successMessage());

  connectedWallet = computed(() => this.wallet.account());
  walletConnected = computed(() => this.wallet.isConnected());
  hasMetaMask = computed(() => this.wallet.hasMetaMask());

  hardhatAccounts: HardhatAccountOption[] = [
    {
      label: 'Account #1 — Manufacturer',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      suggestedRole: 'manufacturer',
    },
    {
      label: 'Account #2 — Distributor',
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      suggestedRole: 'distributor',
    },
    {
      label: 'Account #3 — Pharmacy',
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      suggestedRole: 'pharmacy',
    },
    {
      label: 'Account #4',
      address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    },
    {
      label: 'Account #5',
      address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    },
  ];

  form = this.fb.group({
    role: ['manufacturer' as GrantRoleType, [Validators.required]],
    account: [
      '',
      [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
    ],
    selectedPreset: [''],
  });

  get f() {
    return this.form.controls;
  }

  async connectMetaMask() {
    this.error.set('');
    this.walletLoading.set(true);

    try {
      await this.wallet.switchToHardhat();
      await this.wallet.connectWallet();
    } catch (err: any) {
      console.error(err);
      this.error.set(err?.message || 'Failed to connect MetaMask');
    } finally {
      this.walletLoading.set(false);
    }
  }

  shortAddress(addr?: string | null): string {
    if (!addr) return '—';
    return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  }

  applyPreset() {
    const selected = String(this.form.getRawValue().selectedPreset || '');
    if (!selected) return;

    const preset = this.hardhatAccounts.find((item) => item.address === selected);
    if (!preset) return;

    this.form.patchValue({
      account: preset.address,
      role: preset.suggestedRole || this.form.getRawValue().role || 'manufacturer',
    });

    this.form.get('account')?.markAsTouched();
    this.error.set('');
  }

  submit() {
    this.error.set('');
    this.successMessage.set('');
    this.result.set(null);

    if (!this.isAdmin()) {
      this.error.set('Only admins can grant roles.');
      return;
    }

    if (!this.walletConnected()) {
      this.error.set('Connect the admin MetaMask wallet first.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const role = String(this.form.getRawValue().role) as GrantRoleType;
    const account = String(this.form.getRawValue().account || '').trim();

    this.loading.set(true);

    let action: Promise<any>;

    switch (role) {
      case 'manufacturer':
        action = this.pharmaWeb3.addManufacturer(account);
        break;
      case 'distributor':
        action = this.pharmaWeb3.addDistributor(account);
        break;
      case 'pharmacy':
        action = this.pharmaWeb3.addPharmacy(account);
        break;
      default:
        this.error.set('Unsupported role selected.');
        this.loading.set(false);
        return;
    }

    action
      .then((res) => {
        this.result.set(res);
        this.successMessage.set(`${role} role granted successfully.`);
        this.form.reset({
          role: 'manufacturer',
          account: '',
          selectedPreset: '',
        });
        this.loading.set(false);
      })
      .catch((err: any) => {
        console.error(err);
        this.error.set(
          err?.shortMessage ||
            err?.reason ||
            err?.message ||
            'Failed to grant role with MetaMask'
        );
        this.loading.set(false);
      });
  }
}