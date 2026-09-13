from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from cms.models import (
    CaseStudy,
    ContactInformation,
    ExpertiseArea,
    ExpertiseCapability,
    NavigationItem,
    Page,
    PartnerLogo,
    ProcessStep,
    SiteConfiguration,
    TeamMember,
    ValueCard,
)

# The React public site's static image assets — used only to seed the
# initial photo/logo for records that had a hardcoded image before these
# became CMS-managed, so the site doesn't go blank on first migration.
# Re-upload through React Admin (or Django Admin) any time after that.
FRONTEND_IMAGES_DIR = (
    Path(__file__).resolve().parents[5] / 'frontend' / 'trendshift-cms-web' / 'public' / 'images'
)


def seed_image_file(filename):
    path = FRONTEND_IMAGES_DIR / filename
    if not path.exists():
        return None
    return File(open(path, 'rb'), name=filename)


EXPERTISE = [
    ('Technology Strategy and Digital Transformation', ['IT strategic planning and digital transformation roadmaps', 'Technology investment prioritization and business case development', 'Legacy system modernization strategy', 'Cloud strategy and migration planning', 'Digital maturity assessments and benchmarking', 'Innovation and emerging technology adoption strategy']),
    ('Program and Project Management (PMO)', ['PMO design, standup, and governance', 'Program and project planning, scheduling, and cost management', 'Risk, issue, and dependency management', 'Earned value management (EVM) and performance reporting', 'Multi-vendor and multi-stakeholder program coordination', 'Agile, waterfall, and hybrid delivery methodologies']),
    ('Independent Verification & Validation (IV&V)', ['Independent assessment of requirements, design, and code quality', 'Test strategy and test artifact verification', 'Schedule, cost, and technical risk evaluation', 'Compliance validation against regulatory and contractual standards', 'Systems engineering and lifecycle reviews', 'Executive-level status reporting and early warning of program risk']),
    ('Business Process Improvement', ['Current-state process mapping and gap analysis', 'Lean and Six Sigma-based process redesign', 'Workflow automation and digitization', 'Performance metrics and KPI development', 'Service delivery and user experience optimization', 'Change readiness and implementation support']),
    ('Cybersecurity and Risk Management', ['Risk Management Framework (RMF) and Authority to Operate (ATO) support', 'Cybersecurity strategy, policy, and governance', 'Vulnerability assessments and penetration testing', 'Security architecture and controls implementation', 'Compliance support (FISMA, NIST, FedRAMP, and industry frameworks)', 'Incident response planning and cyber resilience']),
    ('Data Governance and Analytics', ['Data governance frameworks, policies, and stewardship models', 'Data quality management and master data management', 'Data architecture and integration strategy', 'Business intelligence and dashboard development', 'Advanced analytics and predictive modeling', 'Data privacy and regulatory compliance support']),
    ('Enterprise Architecture', ['Enterprise and solution architecture development', 'Business, data, application, and technology architecture alignment', 'Architecture governance and standards', 'Systems rationalization and technical debt reduction', 'Interoperability and integration architecture', 'Alignment with federal and industry architecture frameworks (e.g., TOGAF, FEAF)']),
    ('Organizational Change Management', ['Change management strategy and planning', 'Stakeholder analysis and engagement', 'Communications planning and execution', 'Training strategy and curriculum development', 'Organizational readiness assessments', 'Adoption measurement and reinforcement planning']),
    ('Procurement and Vendor Advisory Services', ['Acquisition strategy and market research', 'Requirements development and RFP/RFQ preparation', 'Source selection support and proposal evaluation', 'Vendor performance management and contract oversight', 'Cost/price analysis and negotiation support', 'Procurement process improvement and compliance']),
    ('AI Governance, Readiness, and Responsible AI Advisory', ['AI readiness and maturity assessments', 'AI governance framework design and policy development', 'Responsible AI risk assessment (bias, transparency, and accountability)', 'AI use case identification and prioritization', 'Regulatory and ethical compliance support (e.g., NIST AI Risk Management Framework, federal AI guidance)', 'AI workforce training and change enablement']),
]

# Pre-existing template/placeholder copy carried over from the original site
# scaffold (not from the Trendshift Areas of Expertise content document).
# Kept as-is rather than invented fresh, per "do not invent content" —
# replace with real client case studies when available.
# Each entry: (title, description, challenge, approach, outcome). The last
# three feed the "Challenge, approach & outcome" section on the case study
# detail page — specific to that engagement rather than repeated boilerplate,
# so every case study actually reads as a distinct project.
CASE_STUDIES = [
    (
        'Enhancing security and maximizing value',
        'To ensure a seamless transition and maintain consistency in user experience, we implemented add-ons and customizations on the cloud platform to mirror the functionalities on the server.',
        "The client needed to migrate critical workloads to the cloud without disrupting the user experience or introducing new security gaps during the transition.",
        "We implemented add-ons and customizations on the cloud platform designed to mirror existing server-side functionality, hardening access controls at every step of the migration.",
        "A seamless transition with consistent user experience, and a security posture that matched the original on-premise environment.",
    ),
    (
        'How AI can help you accelerate your product innovation process',
        'Incremental innovation focuses on enhancing existing products, mostly improving customer retention or enhancing customer acquisition funnels. This is where companies focus the most.',
        "The client's product team was spending most of its energy on incremental improvements to existing features, leaving little room to explore genuinely new innovation opportunities.",
        "We introduced AI-assisted discovery and prioritization tools into their product workflow, helping the team separate high-leverage innovation bets from routine retention work.",
        "Faster identification of high-impact product opportunities, and a repeatable framework the team now uses to balance innovation with day-to-day improvements.",
    ),
    (
        'Streamlining asset and access tracking',
        'Implemented a comprehensive IT Service Management solution with Asset Management and Configuration Management Database (CMDB) system, integrated with SCCM, AWS, Insight Discovery, Active Directory, and home-built applications.',
        "IT assets and access records were scattered across SCCM, AWS, Active Directory and several home-built tools, making audits slow and error-prone.",
        "We implemented a comprehensive ITSM solution with an integrated Asset Management and CMDB system, unifying SCCM, AWS, Insight Discovery, Active Directory and the client's internal applications into one source of truth.",
        "A single, audit-ready view of every asset and access point, cutting reconciliation time and giving IT leadership real-time visibility into their environment.",
    ),
]

# Body copy for the public pages, moved verbatim out of the React
# components into the CMS `Page` entity so every page is editable through
# React Admin instead of hardcoded. `short_description` drives each page's
# hero/banner lede; `description` (rich text) drives its intro/overview
# prose section. Structured, non-prose content (Expertise cards, Case Study
# cards, the contact form) stays driven by its own dedicated CMS entity.
PAGES = [
    (
        'home',
        'Discover Premium Consulting Services',
        'With + 70 years of combined experience in government relations, growth strategy & technology and '
        'innovation we specialize in strategic growth consulting to support the leading edge technology and '
        'innovation companies in the world.',
        '<h2>At TrendShift, we recognize the significance of collaborative efforts in shaping the future of '
        'education.</h2>'
        '<p>Our commitment to excellence is fortified by strong partnerships with educational institutions, '
        'industry leaders, and like-minded organizations.</p>'
        '<p>These alliances amplify our impact, enabling us to deliver innovative solutions and drive positive '
        'change across the education sphere.</p>',
    ),
    (
        'services',
        'Our Services',
        'Practical, high-impact consulting across strategy, assessment, talent development and technology — '
        'built on 70+ years of combined experience.',
        '<h2>We help organizations translate ambition into measurable outcomes.</h2>'
        '<p>Every engagement starts with understanding where you are today and where you need to be. From '
        'there, we build a plan that combines strategic clarity with practical, on-the-ground execution.</p>'
        '<p>Our consultants work alongside your team — not as outside observers — so the results last well '
        'beyond the engagement itself.</p>',
    ),
    (
        'case-studies',
        'Case Studies',
        "Real engagements, real outcomes — a look at how we've partnered with clients to solve complex "
        'problems.',
        '<h2>Results that speak for themselves.</h2>'
        '<p>Each case study below reflects a real engagement where our team worked closely with a client to '
        'solve a specific, high-stakes challenge.</p>'
        '<p>From security modernization to IT asset management, these projects show the range of problems '
        "we're equipped to solve.</p>",
    ),
    (
        'contact',
        'Contact Us',
        'Have a project in mind or a question about our services? Send us a message and our team will '
        'respond shortly.',
        '',
    ),
    (
        'team',
        'Team',
        'The people behind every TrendShift engagement.',
        '',
    ),
    (
        'about',
        'About Us',
        '70+ years of combined experience in government relations, growth strategy and technology innovation '
        '— in service of organizations shaping the future.',
        '<h2>At TrendShift, we recognize the significance of collaborative efforts in shaping the future of '
        'education.</h2>'
        '<p>Our commitment to excellence is fortified by strong partnerships with educational institutions, '
        'industry leaders, and like-minded organizations.</p>'
        '<p>These alliances amplify our impact, enabling us to deliver innovative solutions and drive positive '
        'change across the education sphere and beyond.</p>',
    ),
    (
        'partners',
        'Partners',
        'We work alongside best-in-class technology platforms to deliver integrated, reliable solutions for '
        'our clients.',
        '<h2>Great outcomes rarely come from a single platform working alone.</h2>'
        '<p>We build relationships with technology providers whose tools we trust, so the recommendations we '
        'make are grounded in real hands-on experience.</p>'
        '<p>These partnerships let us integrate the right platforms into your existing stack without adding '
        'unnecessary complexity.</p>',
    ),
    (
        'terms',
        'Terms & Conditions',
        'Please read these terms carefully before using the TrendShift website.',
        '<p>Last updated: August 29, 2026</p>'
        '<h2>1. Introduction</h2>'
        '<p>These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of the TrendShift '
        'website (the &quot;Site&quot;). By accessing or using the Site, you agree to be bound by these Terms. '
        'If you do not agree, please do not use the Site.</p>'
        '<h2>2. Use of the website</h2>'
        '<p>You agree to use the Site only for lawful purposes and in a way that does not infringe the rights '
        'of, restrict or inhibit anyone else&rsquo;s use of the Site. Prohibited behaviour includes:</p>'
        '<ul>'
        '<li>Attempting to gain unauthorized access to the Site, its servers, or any connected systems.</li>'
        '<li>Uploading or transmitting viruses, malware, or any other harmful code.</li>'
        '<li>Using automated systems (bots, scrapers) to extract data without prior written permission.</li>'
        '<li>Submitting false, misleading, or fraudulent information through any form on the Site.</li>'
        '</ul>'
        '<h2>3. Intellectual property</h2>'
        '<p>Unless otherwise stated, all content on this Site &mdash; including text, graphics, logos, and '
        'images &mdash; is the property of TrendShift or its licensors and is protected by applicable '
        'intellectual property laws. You may not reproduce, distribute, or create derivative works from this '
        'content without prior written consent.</p>'
        '<h2>4. User submissions</h2>'
        '<p>Where the Site allows you to submit content, such as comments or contact form messages, you remain '
        'responsible for that content. You agree not to submit anything unlawful, defamatory, or infringing on '
        'a third party&rsquo;s rights. We reserve the right to remove or moderate any submitted content at our '
        'discretion.</p>'
        '<h2>5. Third-party links and partners</h2>'
        '<p>The Site may reference or link to third-party platforms and partners. We are not responsible for '
        'the content, accuracy, or practices of any third-party site, and inclusion of a partner on this Site '
        'does not constitute an endorsement of that party&rsquo;s products or services.</p>'
        '<h2>6. Limitation of liability</h2>'
        '<p>The Site and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis '
        'without warranties of any kind, either express or implied. To the fullest extent permitted by law, '
        'TrendShift shall not be liable for any indirect, incidental, or consequential damages arising from '
        'your use of the Site.</p>'
        '<h2>7. Privacy</h2>'
        '<p>Information submitted through the Site (for example, via the contact or comment forms) is used '
        'solely to respond to your inquiry or display your comment, and is handled in line with applicable '
        'data protection requirements. We do not sell personal information to third parties.</p>'
        '<h2>8. Changes to these terms</h2>'
        '<p>We may update these Terms from time to time. Changes take effect immediately upon being posted to '
        'this page, and the &quot;Last updated&quot; date above will reflect the most recent revision. '
        'Continued use of the Site after changes are posted constitutes acceptance of the updated Terms.</p>'
        '<h2>9. Governing law</h2>'
        '<p>These Terms are governed by and construed in accordance with the laws of the State of New York, '
        'without regard to its conflict of law provisions.</p>'
        '<h2>10. Contact us</h2>'
        '<p>Questions about these Terms can be sent to us via the <a href="/contact">Contact page</a>, by '
        'phone at <a href="tel:+(201) 444-9362">+(201) 444-9362</a>, or by mail to 976 Castleton Avenue, '
        'Staten Island, New York, 10310.</p>'
        '<p><em>This page is a general template and does not constitute legal advice. Please have qualified '
        'legal counsel review and finalize these Terms before relying on them.</em></p>',
    ),
]

# name, role, source image filename (from the frontend's public/images/)
TEAM = [
    ('Stephan Bennett', 'Financial Director', 'team01.png'),
    ('Edric Cunningham', 'Senior Consultent', 'team02.png'),
]

VALUES = [
    ('Mission', 'To help organizations turn complex challenges into clear, achievable strategies that create lasting impact.'),
    ('Vision', 'A future where every organization we work with has the tools, talent and strategy to lead in its field.'),
    ('Values', 'Collaboration, integrity and measurable results guide every engagement we take on.'),
]

PROCESS_STEPS = [
    ('Discover', 'We start by listening — understanding your goals, constraints and the realities your team faces day to day.'),
    ('Design', 'Together we shape a plan that is ambitious enough to matter and realistic enough to execute.'),
    ('Deliver', 'We stay hands-on through delivery, adjusting course as needed to keep outcomes on track.'),
]

# name, source image filename
PARTNERS = [
    ('Adobe', 'adobe.png'),
    ('Mailchimp', 'mailchimp.png'),
    ('Squarespace', 'squarespace.png'),
    ('Lattice', 'lattice.png'),
    ('SurveyMonkey', 'surveymonkey.png'),
    ('Salesforce', 'salesforce.png'),
    ('Dropbox', 'dropbox.png'),
    ('Memberstack', 'memberstack.png'),
    ('Jira Software', 'jira-software.png'),
    ('LiveChat', 'livechat.png'),
    ('Ubersuggest', 'ubersuggest.png'),
    ('Intercom', 'intercom.png'),
]

# label, url, placement — header shows only the 3 primary links; footer
# shows all 6 (the 3 primary links plus Case Studies/Team/Partners).
NAVIGATION = [
    ('Home', '/', NavigationItem.PLACEMENT_BOTH),
    ('Our Services', '/services', NavigationItem.PLACEMENT_BOTH),
    ('Contact Us', '/contact', NavigationItem.PLACEMENT_BOTH),
    ('Case Studies', '/case-studies', NavigationItem.PLACEMENT_FOOTER),
    ('Team', '/team', NavigationItem.PLACEMENT_FOOTER),
    ('Partners', '/partners', NavigationItem.PLACEMENT_FOOTER),
]


class Command(BaseCommand):
    help = 'Create or update initial Trendshift content: expertise areas, case studies, navigation and site identity.'

    def handle(self, *args, **options):
        for order, (title, capabilities) in enumerate(EXPERTISE):
            url_key = slugify(title)
            area, _ = ExpertiseArea.objects.update_or_create(
                url_key=url_key,
                defaults={
                    'title': title,
                    'url_key': url_key,
                    'description': '',
                    'display_order': order,
                    'is_published': True,
                    'is_featured': order < 3,
                },
            )
            area.capabilities.all().delete()
            ExpertiseCapability.objects.bulk_create([
                ExpertiseCapability(expertise_area=area, title=capability, display_order=index)
                for index, capability in enumerate(capabilities)
            ])
        self.stdout.write(self.style.SUCCESS('Seeded 10 Trendshift expertise areas.'))

        for title, description, challenge, approach, outcome in CASE_STUDIES:
            url_key = slugify(title)
            CaseStudy.objects.update_or_create(
                url_key=url_key,
                defaults={
                    'title': title,
                    'url_key': url_key,
                    'short_description': description,
                    'description': description,
                    'challenge': f'<p>{challenge}</p>',
                    'approach': f'<p>{approach}</p>',
                    'outcome': f'<p>{outcome}</p>',
                    'is_enabled': True,
                },
            )
        self.stdout.write(self.style.SUCCESS('Seeded case studies.'))

        for url_key, title, short_description, description in PAGES:
            Page.objects.update_or_create(
                url_key=url_key,
                defaults={
                    'title': title,
                    'url_key': url_key,
                    'short_description': short_description,
                    'description': description,
                    'is_enabled': True,
                },
            )
        self.stdout.write(self.style.SUCCESS('Seeded pages (home, services, case-studies, contact, team, about, partners, terms).'))

        seeded_urls = {url for _, url, _ in NAVIGATION}
        NavigationItem.objects.exclude(url__in=seeded_urls).delete()
        for order, (label, url, placement) in enumerate(NAVIGATION):
            NavigationItem.objects.update_or_create(
                url=url,
                defaults={'label': label, 'display_order': order, 'is_visible': True, 'placement': placement},
            )
        self.stdout.write(self.style.SUCCESS('Seeded navigation.'))

        contact, _ = ContactInformation.objects.get_or_create(
            business_name='TrendShift',
            defaults={
                'email': 'hello@trendshift.com',
                'phone': '+(201) 444-9362',
                'address': '976 Castleton Avenue, Staten Island, New York, 10310',
                'business_hours': 'Monday – Friday, 9:00 AM – 6:00 PM (EST)',
                'is_enabled': True,
            },
        )
        if not contact.business_hours:
            contact.business_hours = 'Monday – Friday, 9:00 AM – 6:00 PM (EST)'
            contact.save(update_fields=['business_hours'])
        SiteConfiguration.objects.get_or_create(
            copyright_text='© 2026 TrendShift. All Rights Reserved.',
            defaults={'address': '976 Castleton Avenue Staten Island, New York, 10310'},
        )
        self.stdout.write(self.style.SUCCESS('Seeded contact information and site configuration.'))

        for order, (name, role, image_file) in enumerate(TEAM):
            member, _ = TeamMember.objects.update_or_create(
                name=name,
                defaults={'role': role, 'display_order': order, 'is_visible': True},
            )
            if not member.photo:
                photo = seed_image_file(image_file)
                if photo:
                    member.photo.save(image_file, photo, save=True)
        self.stdout.write(self.style.SUCCESS('Seeded team members.'))

        for order, (title, description) in enumerate(VALUES):
            ValueCard.objects.update_or_create(
                title=title,
                defaults={'description': description, 'display_order': order, 'is_visible': True},
            )
        self.stdout.write(self.style.SUCCESS('Seeded mission/vision/values.'))

        for order, (title, description) in enumerate(PROCESS_STEPS):
            ProcessStep.objects.update_or_create(
                title=title,
                defaults={'description': description, 'display_order': order, 'is_visible': True},
            )
        self.stdout.write(self.style.SUCCESS('Seeded "how we work" process steps.'))

        for order, (name, image_file) in enumerate(PARTNERS):
            partner, _ = PartnerLogo.objects.update_or_create(
                name=name,
                defaults={'display_order': order, 'is_visible': True},
            )
            if not partner.logo:
                logo = seed_image_file(image_file)
                if logo:
                    partner.logo.save(image_file, logo, save=True)
        self.stdout.write(self.style.SUCCESS('Seeded partner logos.'))
