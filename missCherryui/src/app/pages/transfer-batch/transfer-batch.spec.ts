import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBatch } from './transfer-batch';

describe('TransferBatch', () => {
  let component: TransferBatch;
  let fixture: ComponentFixture<TransferBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferBatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferBatch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
