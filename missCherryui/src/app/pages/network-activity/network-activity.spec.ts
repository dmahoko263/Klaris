import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkActivity } from './network-activity';

describe('NetworkActivity', () => {
  let component: NetworkActivity;
  let fixture: ComponentFixture<NetworkActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
