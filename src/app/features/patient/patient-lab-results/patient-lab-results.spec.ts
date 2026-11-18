import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientLabResults } from './patient-lab-results';

describe('PatientLabResults', () => {
  let component: PatientLabResults;
  let fixture: ComponentFixture<PatientLabResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLabResults],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientLabResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
