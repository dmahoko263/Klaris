import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterBatch } from './register-batch';

describe('RegisterBatch', () => {
  let component: RegisterBatch;
  let fixture: ComponentFixture<RegisterBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterBatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterBatch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
