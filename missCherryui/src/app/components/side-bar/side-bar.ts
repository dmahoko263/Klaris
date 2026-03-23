import { Component, computed, EventEmitter, inject, Input, Output, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { Check, LayoutDashboard, LucideAngularModule, LucideIconData, LucideSquareStack, Settings, User, Wallet } from 'lucide-angular';
import { CommonModule } from '@angular/common';
export type NavItem = {
  label: string;
  icon: LucideIconData;
  to: string;
  exact?: boolean;
};

const LS_COLLAPSE_KEY = "uzi_sidebar_collapsed";
@Component({
  selector: 'app-side-bar',
  imports: [CommonModule,RouterLink,RouterLinkActive,RouterModule,LucideAngularModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
   encapsulation: ViewEncapsulation.None,
})
export class SideBar {
 theme=inject(ThemeService)
  layout = inject(LayoutService);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** mobile drawer open/close */
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
 // desktop collapsed state persisted
collapsed = this.layout.collapsed;  

  widthClass = computed(() => (this.collapsed() ? "w-20" : "w-72"));
  padLeftClass = computed(() => (this.collapsed() ? "md:pl-20" : "md:pl-72"));
nav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", exact: true },
  { label: "Batches", icon: LucideSquareStack, to: "/dashboard/batches" },
  { label: "Wallet Roles", icon: Wallet, to: "/dashboard/wallet-roles" },
  { label: "Verify Batch", icon: Check, to: "/dashboard/verify-batch" },
  { label: "Users", icon: User, to: "/dashboard/users" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

  close() {
    this.openChange.emit(false);
  }

  closeMobile() {
    this.openChange.emit(false);
  }

  toggleCollapsed() {
    this.layout.toggleCollapsed();
  }

  logout() {
    this.auth.logout();
    this.closeMobile();
    this.router.navigateByUrl("/auth");
  }

    currentYear = new Date().getFullYear();
}