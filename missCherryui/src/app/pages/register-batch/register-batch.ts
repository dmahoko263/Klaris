import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ethers } from 'ethers';
import { PharmaService } from '../../core/services/pharma.service';
import { AuthService } from '../../core/services/auth.service';
import { BatchQr } from '../batch-qr/batch-qr';
import { PharmaWeb3Service } from '../../core/services/pharma-web3.service';
import { WalletService } from '../../core/services/wallet.service';
import { IpfsService } from '../../core/services/ipfs.service';

@Component({
  selector: 'app-register-batch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DatePipe, BatchQr],
  templateUrl: './register-batch.html',
  styleUrl: './register-batch.css',
})
export class RegisterBatch {
  private fb = inject(FormBuilder);
  private ipfs = inject(IpfsService);
  private pharmaWeb3 = inject(PharmaWeb3Service);
  private wallet = inject(WalletService);
  auth = inject(AuthService);

  loading = signal(false);
  result = signal<any | null>(null);
  error = signal('');
  successMessage = signal('');
  metadataURI = signal<string | null>(null);
  registeredBatchId = signal<string | null>(null);
  generatedBatchLabel = signal<string | null>(null);
  showLabel = signal(false);
  registeredBatch = signal<any | null>(null);

  hasQr = computed(() => !!this.registeredBatchId());
  hasLabel = computed(() => this.showLabel() && !!this.registeredBatch());

  regulatoryBodies = [
    { region: 'Continental Africa', name: 'African Medicines Agency', acronym: 'AMA', website: 'https://au.int' },
    { region: 'Zimbabwe', name: 'Medicines Control Authority of Zimbabwe', acronym: 'MCAZ', website: 'https://www.mcaz.co.zw' },
    { region: 'South Africa', name: 'South African Health Products Regulatory Authority', acronym: 'SAHPRA', website: 'https://www.sahpra.org.za' },
    { region: 'Nigeria', name: 'National Agency for Food and Drug Administration and Control', acronym: 'NAFDAC', website: 'https://www.nafdac.gov.ng' },
    { region: 'Kenya', name: 'Pharmacy and Poisons Board', acronym: 'PPB', website: 'https://pharmacyboardkenya.org' },
    { region: 'Regional (SADC)', name: 'ZaZiBoNa', acronym: 'ZaZiBoNa', website: 'https://zazibona.org' },
  ];

  form = this.fb.group({
    drugName: ['', [Validators.required]],
    manufacturerName: [this.auth.currentUser()?.organizationName || '', [Validators.required]],
    manufactureDate: ['', [Validators.required]],
    expiryDate: ['', [Validators.required]],
    description: [''],
    dosage: [''],
    form: [''],
    storageConditions: [''],
    manufacturerCountry: [this.auth.currentUser()?.country || ''],
    regulatoryBody: [''],
  });

  private generateBatchId(params: {
    drugName: string;
    manufacturerWallet: string;
    manufactureDate: number;
    expiryDate: number;
    metadataURI?: string;
  }): string {
    const nonce = Date.now();

    const hash = ethers.keccak256(
      ethers.solidityPacked(
        ['string', 'address', 'uint256', 'uint256', 'string', 'uint256'],
        [
          params.drugName.trim(),
          params.manufacturerWallet,
          params.manufactureDate,
          params.expiryDate,
          params.metadataURI || '',
          nonce,
        ]
      )
    );

    return BigInt(hash).toString();
  }

  private shortBatchLabel(batchId: string): string {
    const clean = batchId.replace(/^0+/, '') || batchId;
    return `BATCH-${clean.slice(-12).toUpperCase()}`;
  }

  submit() {
    this.error.set('');
    this.successMessage.set('');
    this.result.set(null);
    this.metadataURI.set(null);
    this.registeredBatchId.set(null);
    this.generatedBatchLabel.set(null);
    this.showLabel.set(false);
    this.registeredBatch.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const manufacturerName =
      this.auth.currentUser()?.organizationName?.trim() ||
      formValue.manufacturerName?.trim() ||
      '';

    if (!manufacturerName) {
      this.error.set('Manufacturer company name is missing from your account profile.');
      return;
    }

    const manufacturerWallet =
      this.wallet.account() ||
      this.auth.currentUser()?.walletAddress ||
      '';

    if (!manufacturerWallet) {
      this.error.set('Connected manufacturer wallet is required.');
      return;
    }

    this.loading.set(true);

    const manufactureUnix = Math.floor(
      new Date(formValue.manufactureDate!).getTime() / 1000
    );

    const expiryUnix = Math.floor(
      new Date(formValue.expiryDate!).getTime() / 1000
    );

    const selectedRegulator = this.regulatoryBodies.find(
      (item) => item.acronym === formValue.regulatoryBody
    );

    const provisionalMetadataUri = `ipfs://pending-${Date.now()}`;

    const generatedBatchId = this.generateBatchId({
      drugName: formValue.drugName!,
      manufacturerWallet,
      manufactureDate: manufactureUnix,
      expiryDate: expiryUnix,
      metadataURI: provisionalMetadataUri,
    });

    const metadata = {
      batchId: generatedBatchId,
      description: formValue.description || '',
      dosage: formValue.dosage || '',
      form: formValue.form || '',
      storageConditions: formValue.storageConditions || '',
      manufacturerCountry: formValue.manufacturerCountry || '',
      regulatoryApproval: selectedRegulator || null,
    };

    const upload$ = this.ipfs.uploadMetadata(metadata);

    upload$.subscribe({
      next: (uploadRes: any) => {
        const finalMetadataUri =
          uploadRes?.uri ||
          uploadRes?.metadataURI ||
          provisionalMetadataUri;

        const payload = {
          batchId: generatedBatchId,
          drugName: formValue.drugName!,
          manufacturerName,
          manufactureDate: manufactureUnix,
          expiryDate: expiryUnix,
          metadataURI: finalMetadataUri,
        };

        this.pharmaWeb3
          .registerBatch(payload as any)
          .then((res) => {
            const savedBatchId = res?.batchId?.toString?.() || generatedBatchId;

            this.result.set(res);
            this.successMessage.set('Batch registered successfully with MetaMask.');
            this.metadataURI.set(finalMetadataUri);
            this.registeredBatchId.set(savedBatchId);
            this.generatedBatchLabel.set(this.shortBatchLabel(savedBatchId));

            this.registeredBatch.set({
              batchId: savedBatchId,
              batchLabel: this.shortBatchLabel(savedBatchId),
              drugName: formValue.drugName,
              manufacturerName,
              manufactureDate: manufactureUnix,
              expiryDate: expiryUnix,
              manufacturerCountry: formValue.manufacturerCountry || '',
              dosage: formValue.dosage || '',
              form: formValue.form || '',
            });

            this.showLabel.set(true);

            this.form.reset({
              drugName: '',
              manufacturerName: this.auth.currentUser()?.organizationName || '',
              manufactureDate: '',
              expiryDate: '',
              description: '',
              dosage: '',
              form: '',
              storageConditions: '',
              manufacturerCountry: this.auth.currentUser()?.country || '',
              regulatoryBody: '',
            });

            this.loading.set(false);
          })
          .catch((err: any) => {
            console.error('REGISTER ERROR:', err);

            this.error.set(
              err?.reason ||
                err?.shortMessage ||
                err?.info?.error?.message ||
                err?.data?.message ||
                err?.message ||
                'Failed to register batch with MetaMask'
            );

            this.loading.set(false);
          });
      },
      error: (err: any) => {
        console.error('METADATA UPLOAD ERROR:', err);

        this.error.set(
          err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            'Failed to upload metadata'
        );

        this.loading.set(false);
      },
    });
  }

  printLabel() {
    window.print();
  }
shortBatchId(id?: string | number | null): string {
  if (id === undefined || id === null) {
    return '—';
  }

  const value = String(id).trim();

  if (!value) {
    return '—';
  }

  return value.length > 5
    ? `${value.slice(0, 5)}...`
    : value;
}

copyBatchId(id?: string | number | null): void {
  if (id === undefined || id === null) return;

  const value = String(id).trim();

  if (!value) return;

  navigator.clipboard.writeText(value)
    .then(() => {
      this.successMessage.set('Batch ID copied');
      console.log('Batch ID copied:', value);
    })
    .catch((error) => {
      console.error('Failed to copy Batch ID:', error);
      this.error.set('Failed to copy Batch ID');
    });
}

}