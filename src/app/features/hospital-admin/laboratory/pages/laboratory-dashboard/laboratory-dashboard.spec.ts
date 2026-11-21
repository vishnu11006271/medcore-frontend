import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryDashboardComponent } from './laboratory-dashboard';

describe('LaboratoryDashboardComponent', () => {
  let component: LaboratoryDashboardComponent;
  let fixture: ComponentFixture<LaboratoryDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
