import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { CommonModule } from '@angular/common';
import { SideBar } from '../../components/side-bar/side-bar';
import { UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet,CommonModule,SideBar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout  {

sidebarOpen = false;
  profileSvc = inject(AuthService);
  layout = inject(LayoutService);

    role: UserRole | undefined;
  address: string | undefined;
  userMail:string|undefined

    constructor() {
    const user = this.profileSvc.currentUser();
    this.role = user?.role;
    this.address = user?.walletAddress;
    this.userMail=user?.email;
}}