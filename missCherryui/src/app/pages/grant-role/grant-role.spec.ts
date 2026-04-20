import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantRole } from './grant-role';

describe('GrantRole', () => {
  let component: GrantRole;
  let fixture: ComponentFixture<GrantRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrantRole]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrantRole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
