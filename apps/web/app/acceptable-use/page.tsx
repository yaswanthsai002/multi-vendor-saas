import { LegalPage } from '../_components/legal-page';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Acceptable use | Perigee' };

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable use policy">
      <p>
        Effective date: 24-11-2026. This policy applies to all Perigee users, including customers,
        vendors, and administrators. It supplements our{' '}
        <a className="underline" href="/terms-of-service">
          Terms of use
        </a>
        .
      </p>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Do not use Perigee to</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Break a law or help another person break a law.</li>
          <li>Impersonate another person or misrepresent your identity or authority.</li>
          <li>Upload content that you do not own or have permission to use.</li>
          <li>Post content that is deceptive, fraudulent, abusive, threatening, or unlawful.</li>
          <li>Enter payment card or bank information. The POC does not process payments.</li>
          <li>Send spam or collect personal data without permission.</li>
          <li>Probe, scan, or attack Perigee, its users, or its service providers.</li>
          <li>Bypass authentication, access controls, rate limits, or account restrictions.</li>
          <li>Upload malware or content that can damage systems or expose data.</li>
          <li>Interfere with Perigee&apos;s availability, security, or normal operation.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Report a problem</h2>
        <p className="mt-3">
          Contact{' '}
          <a className="underline" href="mailto:perigee.notifications@gmail.com">
            perigee.notifications@gmail.com
          </a>{' '}
          to report abuse, a security issue, or content that may break this policy. Include the
          relevant account, page, or record. Do not send passwords, session cookies, or verification
          codes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Enforcement</h2>
        <p className="mt-3">
          We can remove content, restrict features, suspend accounts, or report activity to
          authorities when we reasonably believe that a user has broken this policy or created a
          risk. We will follow the law that applies.
        </p>
      </section>
    </LegalPage>
  );
}
