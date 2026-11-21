import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryOrdersComponent } from './laboratory-orders';

describe('LaboratoryOrdersComponent', () => {
  let component: LaboratoryOrdersComponent;
  let fixture: ComponentFixture<LaboratoryOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryOrdersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
