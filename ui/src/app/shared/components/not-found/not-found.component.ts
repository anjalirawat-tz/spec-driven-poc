import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * NotFoundComponent displays a 404 error page
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Go to Home
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      .not-found-content {
        text-align: center;
        padding: 48px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-width: 500px;
      }

      .not-found-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #f44336;
        margin-bottom: 24px;
      }

      h1 {
        margin: 0 0 16px 0;
        font-size: 32px;
        font-weight: 500;
        color: #333;
      }

      p {
        margin: 0 0 32px 0;
        font-size: 16px;
        color: #666;
      }

      a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
})
export class NotFoundComponent {}
