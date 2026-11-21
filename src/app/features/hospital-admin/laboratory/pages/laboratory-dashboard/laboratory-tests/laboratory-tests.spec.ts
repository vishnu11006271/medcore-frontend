import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryTestsComponent } from './laboratory-tests';

describe('LaboratoryTestsComponent', () => {
  let component: LaboratoryTestsComponent;
  let fixture: ComponentFixture<LaboratoryTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryTestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryTestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
