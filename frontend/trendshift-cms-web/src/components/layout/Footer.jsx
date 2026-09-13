import { Link } from "react-router-dom";
import { BUSINESS, FOOTER_NAV, SOCIAL_LINKS } from "../../data/siteConfig";
import { useResource } from "../../hooks/useResource";

function chunkInHalf(items) {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

// Contact info, footer menu links and social links all come from the CMS —
// `contact` (ContactInformation) and `navigation` (items placed "footer" or
// "both") — with static fallbacks while loading/offline so the footer is
// never left blank.
export default function Footer() {
  const { status, data } = useResource("contact");
  const contact = status === "ready" ? data[0] : null;
  const navigation = useResource("navigation");

  const address = contact?.address || BUSINESS.address;
  const phone = contact?.phone || BUSINESS.phoneDisplay;
  const phoneHref = contact?.phone ? `tel:${contact.phone}` : BUSINESS.phoneHref;
  const socialLinks = contact
    ? [
        { label: "Facebook", href: contact.facebook_url || null },
        { label: "LinkedIn", href: contact.linkedin_url || null },
        { label: "Instagram", href: contact.instagram_url || null },
      ]
    : SOCIAL_LINKS;

  const footerNavItems =
    navigation.status === "ready"
      ? navigation.data.filter((item) => item.placement !== "header").map((item) => ({ to: item.url, label: item.label }))
      : FOOTER_NAV;
  const [footerColumnA, footerColumnB] = chunkInHalf(footerNavItems);

  return (
    <footer>
      <div className="centerdiv clearfix">
        <ul className="lastmenu">
          <li>
            <div className="logo">
              <Link to="/">
                <img src="/images/logo.png" alt="TrendShift logo" />
              </Link>
            </div>
          </li>
          <li>
            <div className="contactwrap">
              <p>{address}</p>
              <div className="smbtn">
                <a href={phoneHref}>{phone}</a>
              </div>
            </div>
          </li>
          <li className="menudiv">
            {[footerColumnA, footerColumnB].map((column, index) => (
              <ul className="menulink" key={`footer-col-${index}`}>
                {column.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label} </Link>
                  </li>
                ))}
              </ul>
            ))}
            <ul className="menulink">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  {/* "#" placeholder when there's no real profile URL yet —
                      keeps this an <a> (so the site's `li a { color: #fff }`
                      styling applies) without a "javascript:void(0)" href. */}
                  <a href={social.href || "#"} target={social.href ? "_blank" : undefined} rel={social.href ? "noreferrer" : undefined}>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <div className="copyright">
        <div className="centerdiv">
          <p>&copy; 2026 TrendShift. All Rights Reserved.</p>
          <a className="credit-link" href="https://integerbyte.com/" target="_blank" rel="noreferrer">
            Designed and Developed by IntegerByte
          </a>
          <a id="backtop" href="#topwrap">
            back to top{" "}
          </a>
        </div>
      </div>
    </footer>
  );
}
