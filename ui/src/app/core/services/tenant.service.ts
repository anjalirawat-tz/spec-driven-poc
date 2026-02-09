import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * TenantService manages the current tenant context
 * In production, this would be populated from authentication/JWT
 */
@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private tenantId: string = environment.devTenantId;

  /**
   * Get the current tenant ID
   */
  getTenantId(): string {
    return this.tenantId;
  }

  /**
   * Set the tenant ID (used after authentication in production)
   * @param tenantId - The tenant ID to set
   */
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  /**
   * Check if a tenant ID is set
   */
  hasTenantId(): boolean {
    return !!this.tenantId;
  }

  /**
   * Clear the tenant ID (used during logout)
   */
  clearTenantId(): void {
    this.tenantId = '';
  }
}
