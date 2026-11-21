import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss'
})
export class FormFieldComponent {
  @Input({ required: true }) inputId = '';
  @Input({ required: true }) label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
}