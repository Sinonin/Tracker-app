/* Sinonin tenant configuration
 *
 * This file is the ONLY tenant-specific source code in the Sinonin PWA repo.
 * Edit ONLY this file to point at a different Apps Script deployment or to
 * change receipt/invoice branding.
 *
 * Schema:
 *   window.TENANT_CONFIG = {
 *     appsScriptUrl: string,        // Apps Script web-app /exec URL
 *     receipt: {                    // Receipt/invoice branding (optional —
 *       businessName, address,      //   if absent, the document feature is
 *       kraPin, logoUrl, footer,    //   hidden for this tenant)
 *       numberPrefix                // tenant code: SF / KB / BF
 *     }
 *   };
 */
window.TENANT_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyQNUy0HX_fC3M9poCgk86dM0bTiGkOpYDvFvSsNvkTjSuTKeA2X79D4UWAD6drHFAazA/exec',
  receipt: {
    businessName: 'Sinonin Food Innovations Ltd',
    address: 'P.O. Box 93, 30301 Nandi Hills, Nandi County, Kenya',
    kraPin: 'P052094623V',
    logoUrl: 'logo.png',
    footer: 'Thank you for your support',
    numberPrefix: 'SF'
  }
};
