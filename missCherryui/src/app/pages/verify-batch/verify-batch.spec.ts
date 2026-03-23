import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyBatch } from './verify-batch';

describe('VerifyBatch', () => {
  let component: VerifyBatch;
  let fixture: ComponentFixture<VerifyBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyBatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyBatch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
