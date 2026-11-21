import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog';

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let component: ConfirmationDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the supplied title and message', () => {
    component.title = 'Deactivate user';
    component.message = 'Are you sure?';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Deactivate user');
    expect(fixture.nativeElement.querySelector('#confirmation-message').textContent).toContain('Are you sure?');
  });

  it('should emit confirmed when the confirm button is clicked', () => {
    const emitSpy = vi.spyOn(component.confirmed, 'emit');
    fixture.nativeElement.querySelector('.confirm-button').click();
    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it('should emit cancelled when the cancel button is clicked', () => {
    const emitSpy = vi.spyOn(component.cancelled, 'emit');
    fixture.nativeElement.querySelector('.cancel-button').click();
    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it('should disable actions while busy', () => {
    component.busy = true;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[1].textContent).toContain('Processing...');
  });

  it('should expose an accessible alert dialog', () => {
    const dialog = fixture.nativeElement.querySelector('[role="alertdialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });
});
