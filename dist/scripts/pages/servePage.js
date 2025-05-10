// src/scripts/pages/servePage.ts
import { auth } from '../utils/auth.js';
import { navigateTo } from '../utils/router.js';
/**
 * Checks authentication and redirects appropriately
 */
export function serveInitialPage() {
    if (auth.checkAuth()) {
        navigateTo('/home');
    }
    else {
        navigateTo('/authentication');
    }
}
