import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorMedicalRecords } from './doctor-medical-records';

describe('DoctorMedicalRecords', () => {
  let component: DoctorMedicalRecords;
  let fixture: ComponentFixture<DoctorMedicalRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMedicalRecords],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorMedicalRecords);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
