/* Sinonin tenant configuration
 *
 * This file is the ONLY tenant-specific source code in the Sinonin PWA repo.
 * Edit ONLY this file to point at a different Apps Script deployment or to
 * change receipt/invoice branding.
 *
 * Schema:
 *   window.TENANT_CONFIG = {
 *     appsScriptUrl: string,             // Apps Script web-app /exec URL
 *     receipt: {                         // Receipt/invoice config (optional —
 *       businessName, address, kraPin,   //   absent => document feature hidden)
 *       logoUrl, footer, numberPrefix,   //   prefix: SF / KB / BF
 *       paymentMethods,                  //   how to pay (shown on invoices)
 *       paymentTerms,                    //   settlement terms (invoices)
 *       vatRate,                         //   % VAT; 0 = placeholder/none, 16 = KE
 *       vatNote                          //   optional note shown at 0% VAT
 *     }
 *   };
 */
window.TENANT_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyQNUy0HX_fC3M9poCgk86dM0bTiGkOpYDvFvSsNvkTjSuTKeA2X79D4UWAD6drHFAazA/exec',
  receipt: {
    businessName: 'Sinonin Food Innovations',
    address: 'P.O. Box 93, 30301 Nandi Hills, Nandi County, Kenya',
    kraPin: 'P052094623V',
    logoUrl: 'logo.png',
    footer: 'Thank you for your support',
    numberPrefix: 'SF',
    paymentMethods: 'M-Pesa Paybill 4157669 · TILL 4986920 STORE NUMBER 5505626',
    paymentTerms: 'Please settle this invoice within 14 days of the date of issue.',
    vatRate: 0,
    vatNote: ''
  }
};
