import { TestBed } from '@angular/core/testing';

import { WalletRoleService } from './wallet-role.service';

describe('WalletRoleService', () => {
  let service: WalletRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
