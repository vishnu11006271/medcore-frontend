import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryOrders } from './laboratory-orders';

describe('LaboratoryOrders', () => {
  let component: LaboratoryOrders;
  let fixture: ComponentFixture<LaboratoryOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryOrders],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
