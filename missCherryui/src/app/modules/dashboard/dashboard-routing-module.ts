import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from '../../pages/dashboard/dashboard';
import { RegisterBatch } from '../../pages/register-batch/register-batch';
import { WalletRoles } from '../../pages/wallet-roles/wallet-roles';
import { VerifyBatch } from '../../pages/verify-batch/verify-batch';
import { Users } from '../../pages/users/users';

const routes: Routes = [  { path: "", component: Dashboard },
  { path: "batches", component: RegisterBatch },
   { path: "wallet-roles", component: WalletRoles },
      { path: "verify-batch", component: VerifyBatch },
      {path:"users",component:Users}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }