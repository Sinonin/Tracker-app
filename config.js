/* Sinonin tenant configuration
 *
 * This file is the ONLY tenant-specific source code in the Sinonin PWA repo. 
 * Every other file (index.html, service-worker.js, logo.png, manifest.json) 
 * is either tenant-agnostic or carries tenant assets at fixed filenames. To 
 * point this PWA at a different Apps Script deployment, edit ONLY this file.
 *
 * Schema:
 *   window.TENANT_CONFIG = {
 *     appsScriptUrl: string  // Apps Script web-app /exec URL
 *   };
 */
window.TENANT_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyQNUy0HX_fC3M9poCgk86dM0bTiGkOpYDvFvSsNvkTjSuTKeA2X79D4UWAD6drHFAazA/exec'
};
