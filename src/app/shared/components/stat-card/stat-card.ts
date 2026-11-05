import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() change = '';
  @Input() icon = '';
  @Input() trend: 'up' | 'down' = 'up';
}