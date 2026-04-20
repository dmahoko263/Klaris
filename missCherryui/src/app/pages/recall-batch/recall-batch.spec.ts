import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallBatch } from './recall-batch';

describe('RecallBatch', () => {
  let component: RecallBatch;
  let fixture: ComponentFixture<RecallBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecallBatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecallBatch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
