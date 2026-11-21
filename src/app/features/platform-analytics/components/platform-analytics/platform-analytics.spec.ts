import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformAnalyticsComponent } from './platform-analytics';

describe('PlatformAnalyticsComponent', () => {
  let component: PlatformAnalyticsComponent;
  let fixture: ComponentFixture<PlatformAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformAnalyticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformAnalyticsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
