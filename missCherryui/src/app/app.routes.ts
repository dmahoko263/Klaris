import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';

export const routes: Routes = [
  {
        path:'',
        component:DashboardLayout,
        children:[
            {
                path:'',
                redirectTo:'dashboard',
                pathMatch:'full',
            },
            {
                path:'dashboard',
                
                loadChildren:()=>import('./modules/dashboard/dashboard-module').then(m=>m.DashboardModule)
            }
        ]
    },
    {
                path:'',
        component:AuthLayout,
        children:[
            {
                path:'',
                redirectTo:'auth',
                pathMatch:'full',
            },
            {
                path:'auth',
                loadChildren:()=>import('./modules/auth/auth-module').then(m=>m.AuthModule)
            }
        ]
    }
];
