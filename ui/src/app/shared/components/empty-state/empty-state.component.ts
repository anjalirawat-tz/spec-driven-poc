import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * EmptyStateComponent displays a message when no data is available
 * Usage: <app-empty-state [icon]="'inbox'" [message]="'No items found'"></app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state-container">
      <mat-icon class="empty-state-icon">{{ icon }}</mat-icon>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-message">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
      }

      .empty-state-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #9e9e9e;
        margin-bottom: 24px;
      }

      .empty-state-title {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 500;
        color: #666;
      }

      .empty-state-message {
        margin: 0 0 24px 0;
        font-size: 14px;
        color: #999;
        max-width: 400px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No Data';
  @Input() message = 'There is no data to display';
}
