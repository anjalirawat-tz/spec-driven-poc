import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TenantService } from '../services/tenant.service';

/**
 * TenantInterceptor automatically adds the X-Tenant-ID header to all HTTP requests
 * This ensures multi-tenant isolation at the API layer
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const tenantId = tenantService.getTenantId();

  // Only add header if tenant ID is available
  if (tenantId) {
    const clonedRequest = req.clone({
      headers: req.headers.set('X-Tenant-ID', tenantId),
    });
    return next(clonedRequest);
  }

  return next(req);
};
