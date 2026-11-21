import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormFieldComponent } from './form-field';

@Component({
  standalone: true,
  imports: [FormFieldComponent],
  template: `
    <app-form-field
      inputId="email"
      label="Email address"
      [required]="true"
      hint="Use your work email"
      error="Enter a valid email address."
    >
      <input id="email" type="email" />
    </app-form-field>
  `
})
class TestHostComponent {}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('associates the label with the projected control', () => {
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(label.htmlFor).toBe('email');
    expect(input.id).toBe('email');
  });

  it('renders the hint and accessible validation error', () => {
    const hint: HTMLElement = fixture.nativeElement.querySelector('.field-hint');
    const error: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');

    expect(hint.textContent).toContain('Use your work email');
    expect(error.textContent).toContain('Enter a valid email address.');
    expect(error.id).toBe('email-error');
  });

  it('marks required fields visibly', () => {
    const indicator: HTMLElement = fixture.nativeElement.querySelector('.required-indicator');
    expect(indicator).toBeTruthy();
  });
});