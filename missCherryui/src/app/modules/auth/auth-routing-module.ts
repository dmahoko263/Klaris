import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from '../../pages/login/login';
import { Register } from '../../pages/register/register';

const routes: Routes = [
    { 
      path: "", 
      component: Login
     },         
     
  { 
    path: "register",
     component: Register 
    } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
