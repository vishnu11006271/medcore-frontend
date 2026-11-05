import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailabilityManagement } from './availability-management';

describe('AvailabilityManagement', () => {
  let component: AvailabilityManagement;
  let fixture: ComponentFixture<AvailabilityManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailabilityManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
