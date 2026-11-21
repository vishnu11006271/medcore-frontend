import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentsListComponent } from './departments-list';

describe('DepartmentsListComponent', () => {
  let component: DepartmentsListComponent;
  let fixture: ComponentFixture<DepartmentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
