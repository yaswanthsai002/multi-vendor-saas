import { LegalPage } from '../_components/legal-page';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of use | Perigee' };

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        Effective date: 24-11-2026. Perigee is operated by Yaswanth Sai Kotagiri in Hyderabad,
        Telangana, India, 500072. By using Perigee, you agree to these terms. If you do not agree,
        do not use the service.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">The POC service</h2>
        <p className="mt-3">
          Perigee is a proof of concept. Features, data, and availability can change. We do not
          promise a service level or uninterrupted access.
        </p>
        <p className="mt-3">
          The POC does not process payments or provide shipping. It does not accept payment card or
          bank details. Product, cart, and order features are for evaluation. An order placed in the
          POC does not create a paid sale, payment duty, or delivery obligation. Do not rely on an
          order record as proof of a purchase or shipment.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Accounts</h2>
        <p className="mt-3">
          Give accurate account information and protect your sign-in details. You are responsible
          for activity through your account. Contact{' '}
          <a className="underline" href="mailto:perigee.notifications@gmail.com">
            perigee.notifications@gmail.com
          </a>{' '}
          if you think someone has used your account without permission.
        </p>
        <p className="mt-3">
          We can suspend or close an account if we reasonably believe that the account breaks these
          terms, creates a security risk, or harms another user or the service. We will follow the
          law that applies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Customer and vendor content</h2>
        <p className="mt-3">
          You keep ownership of content that you submit, subject to rights that you grant to us in
          this section. You confirm that you have the rights needed to submit that content.
        </p>
        <p className="mt-3">
          You give us a limited, non-exclusive, worldwide, royalty-free license to host, store,
          process, display, and transmit your content as needed to operate and improve the POC. This
          license ends when we delete the content, except where a copy remains in a backup or we
          must keep it by law.
        </p>
        <p className="mt-3">
          Vendors are responsible for the accuracy and legality of their profiles, product
          information, images, and other content. Vendor features in this POC do not authorize
          payment collection or shipment through Perigee.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Acceptable use</h2>
        <p className="mt-3">
          Follow our{' '}
          <a className="underline" href="/acceptable-use">
            Acceptable use policy
          </a>
          . Do not use Perigee for unlawful activity, fraud, harassment, or activity that harms the
          service or other users.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Third-party services</h2>
        <p className="mt-3">
          Perigee uses third-party services for hosting, email, sign-in, media storage, avatar
          images, and postal code lookup. Those services have their own terms and privacy notices.
          We do not control their services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Intellectual property</h2>
        <p className="mt-3">
          Perigee and its software, branding, and original content belong to Yaswanth Sai Kotagiri
          or its licensors. These terms do not transfer ownership to you. Do not copy or use Perigee
          material except as the law or these terms allow.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Service changes and termination</h2>
        <p className="mt-3">
          We can change, suspend, or stop the POC. We can remove content or restrict access when
          needed to enforce these terms, protect the service, or follow the law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Disclaimers and liability</h2>
        <p className="mt-3">
          The POC is provided for evaluation. To the extent that the law allows, we provide it
          without a promise that it will be available, error-free, or suitable for a particular
          purpose. This section does not remove rights that the law does not allow us to remove.
        </p>
        <p className="mt-3">
          To the extent that the law allows, Yaswanth Sai Kotagiri is not liable for indirect or
          consequential loss that results from use of the POC. Nothing in these terms limits
          liability where the law does not allow that limit.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text-primary">Governing law and contact</h2>
        <p className="mt-3">
          The laws of India govern these terms, subject to any mandatory consumer rights that apply
          where you live. Courts in Hyderabad, Telangana, India, will hear disputes when the law
          allows this choice.
        </p>
        <p className="mt-3">
          Questions:{' '}
          <a className="underline" href="mailto:perigee.notifications@gmail.com">
            perigee.notifications@gmail.com
          </a>
        </p>
        <p>Yaswanth Sai Kotagiri, Hyderabad, Telangana, India, 500072.</p>
      </section>
    </LegalPage>
  );
}
