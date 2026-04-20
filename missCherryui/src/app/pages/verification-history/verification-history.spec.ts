import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationHistory } from './verification-history';

describe('VerificationHistory', () => {
  let component: VerificationHistory;
  let fixture: ComponentFixture<VerificationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
