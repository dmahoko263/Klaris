import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletRoles } from './wallet-roles';

describe('WalletRoles', () => {
  let component: WalletRoles;
  let fixture: ComponentFixture<WalletRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletRoles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
