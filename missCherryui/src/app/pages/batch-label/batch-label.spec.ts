import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchLabel } from './batch-label';

describe('BatchLabel', () => {
  let component: BatchLabel;
  let fixture: ComponentFixture<BatchLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchLabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchLabel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
