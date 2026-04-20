import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkDelivered } from './mark-delivered';

describe('MarkDelivered', () => {
  let component: MarkDelivered;
  let fixture: ComponentFixture<MarkDelivered>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkDelivered]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkDelivered);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
