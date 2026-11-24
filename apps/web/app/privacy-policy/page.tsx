import { LegalPage } from '../_components/legal-page';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy notice | Perigee' };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy notice">
      <p>
        Effective date: 24-11-2026. Perigee is operated by Yaswanth Sai Kotagiri in Hyderabad,
        Telangana, India, 500072. In this notice, &quot;Perigee,&quot; &quot;we,&quot; and
        &quot;us&quot; mean this operator. Contact{' '}
        <a className="underline" href="mailto:perigee.notifications@gmail.com">
          perigee.notifications@gmail.com
        </a>{' '}
        about privacy requests.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Personal data we collect</h2>
        <p className="mt-3">
          We collect information that you give us when you create or use an account. This can
          include your name, email address, profile image, password hash, and Google account
          identifier when you use Google sign-in. We do not store account passwords in plain text.
        </p>
        <p className="mt-3">
          Customer and vendor features can store vendor profiles, product details, carts, wishlists,
          reviews, orders, and delivery addresses. Address details can include the recipient&apos;s
          name, phone number, street address, city, state, and PIN code.
        </p>
        <p className="mt-3">
          We receive IP addresses for request limits and security. Vercel Analytics and Speed
          Insights collect page and device data. See our{' '}
          <a className="underline" href="/cookie-notice">
            Cookie and local storage notice
          </a>
          .
        </p>
        <p className="mt-3">
          Your browser stores a selected PIN code and city, and a pending order request. The pending
          request can contain an address ID, product IDs, quantities, expected prices, and a retry
          key.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">How we use data</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Create and secure accounts.</li>
          <li>Verify email addresses and reset passwords.</li>
          <li>Provide product, vendor, cart, wishlist, review, and order features.</li>
          <li>Store and show profile, product, and campaign media.</li>
          <li>Send account and service emails.</li>
          <li>Check Indian PIN codes when you request a location lookup.</li>
          <li>Measure website use and performance with Vercel Analytics and Speed Insights.</li>
          <li>
            Detect abuse, investigate failures, protect the service, and answer your requests.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Service providers and sharing</h2>
        <p className="mt-3">These services can process data when you use the related feature:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>AWS hosts the deployed application on an EC2 instance in Sydney, Australia.</li>
          <li>Vercel provides Web Analytics and Speed Insights.</li>
          <li>Cloudflare R2 stores uploaded media and import files when enabled.</li>
          <li>Gmail SMTP sends account and order email when configured.</li>
          <li>Google provides sign-in when you choose Google sign-in.</li>
          <li>api.postalpincode.in receives a PIN code for a location lookup.</li>
          <li>
            DiceBear receives your name or email address as an avatar seed when you have no uploaded
            avatar. The app sends this value in the image request URL.
          </li>
        </ul>
        <p className="mt-3">
          AWS hosts the application in Sydney, Australia (Region ap-southeast-2, Availability Zone
          ap-southeast-2a). Other providers can process data in other countries. Check each
          provider&apos;s privacy notice for its processing locations and terms.
        </p>
        <p className="mt-3">
          Vendors can see order details that they need to manage an order. Perigee does not use a
          payment processor or shipping carrier. Do not enter payment card or bank details.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Cookies and browser storage</h2>
        <p className="mt-3">
          We use HTTP-only cookies for sign-in, email verification, and password reset. Production
          cookies use the Secure flag. We also use local storage for a selected PIN code and city,
          and to keep a pending order request for safe retry after a network error. See our{' '}
          <a className="underline" href="/cookie-notice">
            Cookie and local storage notice
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Retention and requests</h2>
        <p className="mt-3">
          Perigee does not automatically delete inactive accounts. There is no self-service account
          deletion feature. We have not set retention periods for inactive accounts or service logs.
          We have not set an application backup schedule or backup retention period.
        </p>
        <p className="mt-3">
          Email{' '}
          <a className="underline" href="mailto:perigee.notifications@gmail.com">
            perigee.notifications@gmail.com
          </a>{' '}
          to ask for access, correction, or deletion of your information. We review each request
          under applicable law. We may need to keep some information to meet legal duties.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Security and children</h2>
        <p className="mt-3">
          We use authentication, access controls, and other safeguards to protect data. No internet
          service can guarantee complete security. Email the privacy contact above to report a
          security problem.
        </p>
        <p className="mt-3">
          Perigee does not set an age limit, check a user&apos;s age, or have a parent or guardian
          consent process. Contact the privacy email if you believe a child has provided personal
          data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Changes and contact</h2>
        <p className="mt-3">
          We will update this notice when our data practices change. We will publish the current
          version and update its effective date.
        </p>
        <p className="mt-3">Yaswanth Sai Kotagiri, Hyderabad, Telangana, India, 500072.</p>
        <p>
          Privacy:{' '}
          <a className="underline" href="mailto:perigee.notifications@gmail.com">
            perigee.notifications@gmail.com
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
