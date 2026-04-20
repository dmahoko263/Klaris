import { Component, computed, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import {
  Check,
  LayoutDashboard,
  LucideAngularModule,
  LucideIconData,
  LucideSquareStack,
  Settings,
  User,
  Wallet,
  Network,ScanBarcode,Send,LucideLocate,
  LocateIcon,AlignHorizontalDistributeEndIcon,History,CircleArrowOutUpLeftIcon,
  Clock
} from 'lucide-angular';
import { CommonModule } from '@angular/common';

export type NavItem = {
  label: string;
  icon: LucideIconData;
  to: string;
  exact?: boolean;
  roles?: string[];
};

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, LucideAngularModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
  encapsulation: ViewEncapsulation.None,
})
export class SideBar {
  theme = inject(ThemeService);
  layout = inject(LayoutService);
  private auth = inject(AuthService);
  private router = inject(Router);

  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  collapsed = this.layout.collapsed;

  widthClass = computed(() => (this.collapsed() ? 'w-20' : 'w-72'));
  padLeftClass = computed(() => (this.collapsed() ? 'md:pl-20' : 'md:pl-72'));

  currentRole = computed(() => this.auth.currentUser()?.role);

  private allNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/dashboard',
      exact: true,
      roles: ['admin', 'manufacturer', 'distributor', 'pharmacy'],
    },
    {
      label:'Network Activity',
      icon:Network,
      to:'/dashboard/network-activity',
      roles:['admin'],
    }
    ,
    {
      label: 'Batches',
      icon: LucideSquareStack,
      to: '/dashboard/batches',
      roles: ['manufacturer'],
    },
    // {
    //   label: 'History',
    //   icon: History,
    //   to: '/dashboard/history',
    //   roles: ['manufacturer'],
    // },
    // {
    //   label: 'Wallet Roles',
    //   icon: Wallet,
    //   to: '/dashboard/wallet-roles',
    //   roles: ['admin'],
    // },
    {
      label: 'Verify Batch',
      icon: Check,
      to: '/dashboard/verify-batch',
      roles: ['patient', 'distributor', 'pharmacy', 'manufacturer'], // changed here
    },{
  label: 'Scan QR',
  icon: ScanBarcode,
  to: '/dashboard/scan-batch',
  roles: ['patient'], // added this new item
},
{
  label: 'Mark Delivered',
  icon: LocateIcon,
  to: '/dashboard/mark-delivered',
  roles: [ 'distributor', 'pharmacy'], // added this new item
},{
      label: 'Ownership History',
      icon: AlignHorizontalDistributeEndIcon,
      to: '/dashboard/ownership-history',
      roles: ['patient', 'distributor', 'pharmacy', 'manufacturer', 'admin'], // added this new item
},
    {
      label: 'Transfer Batch',
      icon: Send,
      to: '/dashboard/transfer-batch',
      roles: ['patient', 'distributor', 'pharmacy', 'manufacturer', 'admin'], // added this new item
    },
    {
      label: 'Recall Batch',
      icon: CircleArrowOutUpLeftIcon, // Replace with actual icon
      to: '/dashboard/recall-batch',
      roles: ['admin','manufacturer'], // added this new item
    },
    {
      label: 'Verification History',
      icon: History,
      to: '/dashboard/verification-history',
      roles: ['admin', ],
    },
    {
      label: 'Grant Role',
      icon: User,
      to: '/dashboard/grant-role',
      roles: ['admin'], // added this new item
    },
    {
      label: 'Admin Analytics',
      icon: LayoutDashboard,
      to: '/dashboard/admin-analytics',
      roles: ['admin'],
    },
    {
      label: 'Supply Chain Timeline',
      icon: Clock,
      to: '/dashboard/supply-chain-timeline',
      roles: ['admin'],
    },
    {
      label: 'Users',
      icon: User,
      to: '/dashboard/users',
      roles: ['admin'],
    },
    {
      label: 'Settings',
      icon: Settings,
      to: '/settings',
      roles: ['admin'],
    },

  ];

  navItems = computed(() => {
    const role = this.currentRole();
    if (!role) return [];

    return this.allNavItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    });
  });

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
    this.router.navigateByUrl('/auth');
  }

  currentYear = new Date().getFullYear();
}