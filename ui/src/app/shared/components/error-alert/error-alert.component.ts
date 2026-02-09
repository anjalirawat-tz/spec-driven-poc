import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * ErrorAlertComponent displays error messages with optional retry action
 * Usage: <app-error-alert [message]="'Error message'" (retry)="onRetry()"></app-error-alert>
 */
@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="error-alert-container" [class.dismissible]="dismissible">
      <div class="error-content">
        <mat-icon class="error-icon">error</mat-icon>
        <div class="error-text">
          <h4 *ngIf="title" class="error-title">{{ title }}</h4>
          <p class="error-message">{{ message }}</p>
        </div>
      </div>
      <div class="error-actions" *ngIf="showRetry || dismissible">
        <button
          *ngIf="showRetry"
          mat-button
          color="primary"
          (click)="onRetryClick()"
        >
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
        <button
          *ngIf="dismissible"
          mat-icon-button
          (click)="onDismissClick()"
          aria-label="Dismiss error"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .error-alert-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: #ffebee;
        border: 1px solid #f44336;
        border-radius: 4px;
        margin: 16px 0;
      }

      .error-content {
        display: flex;
        gap: 12px;
        flex: 1;
      }

      .error-icon {
        color: #f44336;
        font-size: 24px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .error-text {
        flex: 1;
      }

      .error-title {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 500;
        color: #d32f2f;
      }

      .error-message {
        margin: 0;
        font-size: 14px;
        color: #c62828;
      }

      .error-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
      }
    `,
  ],
})
export class ErrorAlertComponent {
  @Input() title?: string;
  @Input() message = 'An error occurred';
  @Input() showRetry = false;
  @Input() dismissible = false;

  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  onRetryClick(): void {
    this.retry.emit();
  }

  onDismissClick(): void {
    this.dismiss.emit();
  }
}
