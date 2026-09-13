import SEO from "../components/seo/SEO";
import InnerBanner from "../components/common/InnerBanner";
import SectionHeading from "../components/common/SectionHeading";
import ContactForm from "../components/forms/ContactForm";
import { BUSINESS } from "../data/siteConfig";
import { useResource } from "../hooks/useResource";

const BREADCRUMB = [{ label: "Home", to: "/" }, { label: "Contact" }];

// InnerBanner title/lede come from the CMS `pages` resource (slug
// "contact"); contact details come from the `contact` resource — both fall
// back to static data while loading/offline so the page is never blank.
export default function ContactPage() {
  const { status, data } = useResource("contact");
  const contact = status === "ready" ? data[0] : null;
  const address = contact?.address || BUSINESS.addressLine1;
  const phone = contact?.phone || BUSINESS.phoneDisplay;
  const phoneHref = contact?.phone ? `tel:${contact.phone}` : BUSINESS.phoneHref;
  const email = contact?.email || BUSINESS.email;
  const hours = contact?.business_hours || BUSINESS.hours;

  const { status: pageStatus, data: page } = useResource("pages", { id: "contact" });

  return (
    <>
      <SEO overrideTitle={pageStatus === "ready" && page.meta_title ? page.meta_title : undefined} overrideDescription={pageStatus === "ready" ? page.meta_description : undefined} />

      <InnerBanner
        title={pageStatus === "ready" ? page.title : "Contact Us"}
        lede={
          pageStatus === "ready"
            ? page.short_description?.replace(/<[^>]+>/g, "")
            : "Have a project in mind or a question about our services? Send us a message and our team will respond shortly."
        }
        breadcrumbItems={BREADCRUMB}
      />

      <section className="smgap contactsection">
        <div className="centerdiv clearfix">
          <div className="contactgrid">
            <div>
              <SectionHeading>Get in touch</SectionHeading>
              <div className="contactinfo-card">
                <ul>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FE4E16" strokeWidth="1.5" aria-hidden="true">
                      <path d="M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <div>
                      <h3>Address</h3>
                      <p>{address}</p>
                    </div>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FE4E16" strokeWidth="1.5" aria-hidden="true">
                      <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" />
                    </svg>
                    <div>
                      <h3>Phone</h3>
                      <a href={phoneHref}>{phone}</a>
                    </div>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FE4E16" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    <div>
                      <h3>Email</h3>
                      <a href={`mailto:${email}`}>{email}</a>
                    </div>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FE4E16" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    <div>
                      <h3>Business hours</h3>
                      <p>{hours}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <SectionHeading>Send a message</SectionHeading>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
