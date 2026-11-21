import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalErrorDialogComponent } from './shared/components/global-error-dialog/global-error-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalErrorDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}