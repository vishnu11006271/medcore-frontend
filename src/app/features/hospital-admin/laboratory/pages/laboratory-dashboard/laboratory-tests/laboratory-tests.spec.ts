import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryTests } from './laboratory-tests.js';

describe('LaboratoryTests', () => {
  let component: LaboratoryTests;
  let fixture: ComponentFixture<LaboratoryTests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryTests],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryTests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
