import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border-default mt-auto transition-colors duration-200">
      {/* Upper Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/assets/perigee-primary-light.svg"
                alt="Perigee"
                width={120}
                height={36}
                className="dark:hidden h-7 w-auto"
              />
              <Image
                src="/assets/perigee-primary-dark.svg"
                alt="Perigee"
                width={120}
                height={36}
                className="hidden dark:block h-7 w-auto"
              />
            </Link>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Curated marketplace with distinctive independent brands.
            </p>
          </div>

          {/* Col 2: About Perigee */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              About Perigee
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/blog" className="hover:text-text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-text-primary transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Perigee Service */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Perigee Service
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/contact" className="hover:text-text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-text-primary transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-text-primary transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Seller Portal */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Seller
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/vendor/apply" className="hover:text-text-primary transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/vendor/sell" className="hover:text-text-primary transition-colors">
                  Sell
                </Link>
              </li>
              <li>
                <Link href="/vendor/support" className="hover:text-text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Follow Perigee */}
          {/* <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Follow Perigee
            </h3>
            <div className="flex items-center gap-3 text-text-secondary">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Perigee on Facebook"
                className="hover:text-text-primary transition-colors"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Perigee on Instagram"
                className="hover:text-text-primary transition-colors"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Perigee on YouTube"
                className="hover:text-text-primary transition-colors"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div> */}

          {/* Col 6: Payments Accepted */}
          {/* <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Payments Accepted
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-surface-raised border border-border-default rounded font-medium text-text-secondary">
                AMEX
              </span>
              <span className="px-2 py-1 bg-surface-raised border border-border-default rounded font-medium text-text-secondary">
                Apple Pay
              </span>
              <span className="px-2 py-1 bg-surface-raised border border-border-default rounded font-medium text-text-secondary">
                PayPal
              </span>
              <span className="px-2 py-1 bg-surface-raised border border-border-default rounded font-medium text-text-secondary">
                Mastercard
              </span>
              <span className="px-2 py-1 bg-surface-raised border border-border-default rounded font-medium text-text-secondary">
                VISA
              </span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Sub-Footer Bottom Bar */}
      <div className="border-t border-border-subtle bg-surface-subtle/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-tertiary gap-2">
          <div className="flex gap-2">
            <Link href="/privacy-policy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>{' '}
            &bull;
            <Link href="/terms-of-service" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>{' '}
            &bull;
            <Link href="/terms-of-service" className="hover:text-text-primary transition-colors">
              Accessibility
            </Link>
          </div>
          <div>© {new Date().getFullYear()} Perigee Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
