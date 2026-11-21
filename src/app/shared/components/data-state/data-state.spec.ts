import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataStateComponent } from './data-state';

describe('DataStateComponent', () => {
  let fixture: ComponentFixture<DataStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataStateComponent);
  });

  it('shows an accessible loading state', () => {
    fixture.componentInstance.variant = 'loading';
    fixture.componentInstance.message = 'Loading users...';
    fixture.detectChanges();

    const state = fixture.nativeElement.querySelector('[role="status"]');
    expect(state.textContent).toContain('Loading users...');
    expect(state.getAttribute('aria-live')).toBe('polite');
  });

  it('shows an error and emits retry action', () => {
    const actionSpy = vi.fn();
    fixture.componentInstance.variant = 'error';
    fixture.componentInstance.title = 'Unable to load users';
    fixture.componentInstance.message = 'Request failed';
    fixture.componentInstance.actionLabel = 'Retry';
    fixture.componentInstance.action.subscribe(actionSpy);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Request failed');

    fixture.nativeElement.querySelector('button').click();
    expect(actionSpy).toHaveBeenCalledOnce();
  });

  it('shows a helpful empty state', () => {
    fixture.componentInstance.variant = 'empty';
    fixture.componentInstance.title = 'No users found';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain('No users found');
  });
});
