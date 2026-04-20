import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanBatch } from './scan-batch';

describe('ScanBatch', () => {
  let component: ScanBatch;
  let fixture: ComponentFixture<ScanBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanBatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanBatch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
