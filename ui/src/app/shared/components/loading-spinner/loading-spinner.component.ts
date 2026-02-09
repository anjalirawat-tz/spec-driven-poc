import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * LoadingSpinnerComponent displays a loading indicator
 * Usage: <app-loading-spinner [size]="'medium'" [message]="'Loading...'"></app-loading-spinner>
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner-container" [class]="'size-' + size">
      <mat-spinner
        [diameter]="getDiameter()"
        [strokeWidth]="getStrokeWidth()"
      ></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .loading-message {
        margin-top: 16px;
        font-size: 14px;
        color: #666;
        text-align: center;
      }

      .size-small {
        padding: 16px;
      }

      .size-large {
        padding: 48px;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message?: string;

  getDiameter(): number {
    switch (this.size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  }

  getStrokeWidth(): number {
    switch (this.size) {
      case 'small':
        return 3;
      case 'large':
        return 5;
      default:
        return 4;
    }
  }
}
