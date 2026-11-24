import { LegalPage } from '../_components/legal-page';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cookie notice | Perigee' };

export default function CookieNoticePage() {
  return (
    <LegalPage title="Cookie and local storage notice">
      <p>
        Effective date: 24-11-2026. Perigee uses cookies and browser storage for account features.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Cookies</h2>
        <p className="mt-3">
          Perigee uses HTTP-only cookies for sign-in, email verification, and password reset. The
          cookies use SameSite=Lax. Production cookies use the Secure flag.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>The sign-in cookie lasts for two hours.</li>
          <li>The email verification cookie lasts for 15 minutes.</li>
          <li>The password reset cookie lasts for 10 minutes.</li>
        </ul>
        <p className="mt-3">These cookies support account functions that you request.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Local storage</h2>
        <p className="mt-3">
          Perigee stores your selected Indian PIN code and its city in browser local storage. It
          also stores a pending order request. This request contains an address ID, product IDs,
          quantities, expected prices, and a retry key. Perigee uses the request to retry an order
          after a network failure.
        </p>
        <p className="mt-3">
          You can clear local storage in your browser settings. If you clear a pending order
          request, check your order history before you submit the order again.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Analytics and performance</h2>
        <p className="mt-3">
          Perigee uses Vercel Web Analytics and Vercel Speed Insights. Vercel says Web Analytics
          does not use cookies. It records page views and related data, such as page path, referrer,
          approximate location, browser, operating system, and device type. Vercel says its visitor
          hash expires after 24 hours.
        </p>
        <p className="mt-3">
          Speed Insights records performance data, such as Web Vitals, page route, browser,
          operating system, device type, network speed, country, and event time. Vercel says these
          measurements do not identify a visitor or store the visitor&apos;s IP address.
        </p>
        <p className="mt-3">
          Perigee does not use advertising trackers in the application source. Do not put names,
          email addresses, order IDs, or tokens in page URLs or analytics events.
        </p>
      </section>

      <p>
        Questions:{' '}
        <a className="underline" href="mailto:perigee.notifications@gmail.com">
          perigee.notifications@gmail.com
        </a>
      </p>
    </LegalPage>
  );
}
