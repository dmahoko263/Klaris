import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchQr } from './batch-qr';

describe('BatchQr', () => {
  let component: BatchQr;
  let fixture: ComponentFixture<BatchQr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchQr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchQr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
