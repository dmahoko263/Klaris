import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyChainTimeline } from './supply-chain-timeline';

describe('SupplyChainTimeline', () => {
  let component: SupplyChainTimeline;
  let fixture: ComponentFixture<SupplyChainTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyChainTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyChainTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
