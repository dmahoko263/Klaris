import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnershipHistory } from './ownership-history';

describe('OwnershipHistory', () => {
  let component: OwnershipHistory;
  let fixture: ComponentFixture<OwnershipHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnershipHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnershipHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
