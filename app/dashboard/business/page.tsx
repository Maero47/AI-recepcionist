import { AppShell } from "@/components/AppShell";
import { BusinessForm } from "@/components/BusinessForm";
import { FAQEditor } from "@/components/FAQEditor";
import { ServiceEditor } from "@/components/ServiceEditor";
import { buildSystemPolicy } from "@/lib/ai";
import { getDefaultBusiness, listFaqs, listServices } from "@/lib/store";

export default function BusinessSetupPage() {
  const business = getDefaultBusiness();
  const services = listServices(business.id);
  const faqs = listFaqs(business.id);
  const policyPreview = buildSystemPolicy(business, services, faqs);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Business setup</p>
          <h1>Approved facts, services, FAQs, and handoff rules</h1>
          <p className="lede">
            This is the control surface for what the receptionist can say, what it must capture, and when it escalates.
          </p>
        </div>
      </header>

      <div className="stack">
        <BusinessForm business={business} />
        <ServiceEditor businessId={business.id} initialServices={services} />
        <FAQEditor businessId={business.id} initialFaqs={faqs} />
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Assistant policy preview</h2>
              <p className="muted">Generated from the business profile, service list, FAQs, and safety rules.</p>
            </div>
          </div>
          <pre className="transcript">{policyPreview}</pre>
        </section>
      </div>
    </AppShell>
  );
}
