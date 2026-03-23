import { Component, inject, NgModule } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmaService } from '../../core/services/pharma.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { IpfsService } from '../../core/services/ipfs.service';

@Component({
  selector: 'app-register-batch',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register-batch.html',
  styleUrl: './register-batch.css',
})
export class RegisterBatch {
   private fb = inject(FormBuilder);
  private pharma = inject(PharmaService);
  private ipfs=inject(IpfsService)
auth=inject(AuthService);

walletAddress=this.auth.currentUser()?.walletAddress
  loading = false;
  result: any = null;
  error = '';
  successMessage=''
metadataURI: string | null | undefined = null;

getMetadataPreview() {
  const formValue = this.form.value;
  return {
    batchId: formValue.batchId,
    description: formValue.description,
    dosage: formValue.dosage,
    form: formValue.form,
    storageConditions: formValue.storageConditions,
    manufacturerCountry: formValue.manufacturerCountry,
    regulatoryApproval: formValue.regulatoryApproval,
  };
}
  // Form setup with metadata fields
  form = this.fb.group({
    batchId: [null as number | null, [Validators.required]],
    drugName: ['', [Validators.required]],
    manufacturerName: ['', [Validators.required]],
    manufactureDate: ['', [Validators.required]],
    expiryDate: ['', [Validators.required]],
    description: [''],
    dosage: [''],
    form: [''],
    storageConditions: [''],
    manufacturerCountry: [''],
    regulatoryApproval: [''],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.result = null;
    this.error = '';

    try {
      const formValue = this.form.value;

      // Convert calendar dates to Unix timestamps
      const manufactureUnix = Math.floor(
        new Date(formValue.manufactureDate!).getTime() / 1000
      );
      const expiryUnix = Math.floor(
        new Date(formValue.expiryDate!).getTime() / 1000
      );

      // Build metadata JSON from form values
      const metadata = {
        batchId: formValue.batchId!,
        description: formValue.description || '',
        dosage: formValue.dosage || '',
        form: formValue.form || '',
        storageConditions: formValue.storageConditions || '',
        manufacturerCountry: formValue.manufacturerCountry || '',
        regulatoryApproval: formValue.regulatoryApproval || '',
      };
const metadataURI ="jjjjj";
      // Upload metadata to IPFS via backend
      // const metadataURI = await this.pharma.uploadMetadata(metadata).toPromise();
this.metadataURI = metadataURI;
      // Final payload to register batch
      const payload = {
        batchId: formValue.batchId!,
        drugName: formValue.drugName!,
        manufacturerName: formValue.manufacturerName!,
        manufactureDate: manufactureUnix,
        expiryDate: expiryUnix,
        metadataURI,
        walletAddress: this.walletAddress, 
      };

      console.log('Payload ready for blockchain:', payload);

      // Register batch on blockchain
     this.pharma.registerBatch(payload).subscribe({
  next: (res: any) => {
    this.result = res;
    if (res.ok) {
      this.successMessage = res.message || 'Batch registered successfully!';
      alert(this.successMessage)
  
    }
     this.loading = false;
  },
       
      });
    } catch (err) {
      console.error(err);
      this.error = 'Failed to upload metadata or register batch';
      this.loading = false;
    }
  }
}