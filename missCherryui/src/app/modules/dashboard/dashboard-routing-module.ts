import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from '../../pages/dashboard/dashboard';
import { RegisterBatch } from '../../pages/register-batch/register-batch';
import { WalletRoles } from '../../pages/wallet-roles/wallet-roles';
import { VerifyBatch } from '../../pages/verify-batch/verify-batch';
import { Users } from '../../pages/users/users';
import { ScanBatch } from '../../pages/scan-batch/scan-batch';
import { NetworkActivity } from '../../pages/network-activity/network-activity';
import { TransferBatch } from '../../pages/transfer-batch/transfer-batch';
import { MarkDelivered } from '../../pages/mark-delivered/mark-delivered';
import { OwnershipHistory } from '../../pages/ownership-history/ownership-history';
import { RecallBatch } from '../../pages/recall-batch/recall-batch';
import { VerificationHistory } from '../../pages/verification-history/verification-history';
import { AdminAnalytics } from '../../pages/admin-analytics/admin-analytics';
import { GrantRole } from '../../pages/grant-role/grant-role';
import { SupplyChainTimeline } from '../../pages/supply-chain-timeline/supply-chain-timeline';

const routes: Routes = [  { path: "", component: Dashboard },
  { path: "batches", component: RegisterBatch },
   { path: "wallet-roles", component: WalletRoles },
      { path: "verify-batch", component: VerifyBatch },
      { path: 'verify', component: VerifyBatch },
{ path: 'verify/:batchId', component: VerifyBatch },
      {path:"users",component:Users},
      {path:"scan-batch",component:ScanBatch},
      { path: 'network-activity', component: NetworkActivity },
      { path: 'transfer-batch', component: TransferBatch },
      { path: 'mark-delivered', component: MarkDelivered },
      { path: 'ownership-history', component: OwnershipHistory },
      { path: 'recall-batch', component: RecallBatch },
      { path: 'verification-history', component: VerificationHistory },
      { path: 'admin-analytics', component: AdminAnalytics },
      { path: 'grant-role', component: GrantRole },
      { path: 'supply-chain-timeline', component: SupplyChainTimeline },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }