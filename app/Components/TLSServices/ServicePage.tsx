import { Monitor, Clock, BarChart2, Sparkles, LifeBuoy, type LucideIcon } from "lucide-react";
import { Instrument_Serif, Geist } from "next/font/google";
import Link from "next/link";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });
const geist = Geist({ subsets: ["latin"] });

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  cta: string;
  href: string;
}

const services = [
  {
    icon: Monitor,
    title: "Build Your Legal Website",
    description:
      "We help law firms and legal professionals build modern websites that improve credibility, visibility, and client engagement. From redesigns to WordPress migrations, TLS creates fast, scalable, and professionally designed legal websites tailored to your practice.",
    tags: ["Website Design & Redesign", "WordPress Migration", "SEO & Performance Optimization"],
    cta: "Start Project",
    href: "/dashboard/TLS-Services/website",
  },
  {
    icon: Clock,
    title: "Build an Appointment System",
    description:
      "We help law firms create seamless consultation booking systems that allow clients to schedule appointments based on lawyers, office locations, or practice areas. TLS builds organised and easy-to-manage booking experiences tailored to your firm.",
    tags: ["Practice Areas", "Office Locations", "Consultation Booking", "Multi-lawyer Scheduling"],
    cta: "Build System",
    href: "/dashboard/TLS-Services/appointment-system",
  },
  {
    icon: BarChart2,
    title: "Build Custom Productivity Tools",
    description:
      "We help law firms build custom internal systems for managing workflows, tracking time, monitoring staff activity, and organising daily operations through modern legal productivity tools tailored to your practice.",
    tags: ["Time Tracking", "Staff Management", "Operational Dashboards", "Workflow Systems"],
    cta: "Build Solution",
    href: "/dashboard/TLS-Services/productivity-tools",
  },
  {
    icon: Sparkles,
    title: "Tech Consulting",
    description:
      "We help law firms modernise operations, improve digital workflows, and make better technology decisions through strategic legal-tech consulting tailored to your practice and long-term growth.",
    tags: ["Digital Transformation", "Workflow Optimization", "Infrastructure Planning", "Legal-Tech Strategy"],
    cta: "Book Consultation",
    href: "/dashboard/TLS-Services/consultation",
  },
];

function ServiceCard({ icon: Icon, title, description, tags, cta, href }: Service) {
  return (
    <div
      className={`${geist.className} bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4`}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "#eff6ff" }}
      >
        <Icon size={18} style={{ color: "#2563eb" }} strokeWidth={1.6} />
      </div>

      <h3 className="text-[17px] font-semibold text-gray-900 leading-snug">{title}</h3>

      <p className="text-[13px] text-gray-500 leading-relaxed flex-1">{description}</p>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 bg-white"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={href}
        className="mt-auto self-start flex items-center gap-1.5 px-4 py-2.5 rounded-md text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "#2563eb" }}
      >
        {cta}
        <span className="text-base leading-none">→</span>
      </Link>
    </div>
  );
}

export default function ServicePage() {
  return (
    <div className={`${geist.className} bg-[#ffffff] px-6 py-8 flex flex-col gap-6`}>

      {/* Section label */}
      <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">
        Featured Service
      </p>

      {/* Promote event hero banner */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-100"
        style={{
          background: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "220px",
        }}
      >
        {/* Left: text */}
        <div className="p-6 flex flex-col gap-4 justify-center ">
          <div>
            <h2
              className={`${geist.className} text-[20px] text-gray-900 leading-snug mb-2`}
            >
              Promote your event to The Legal Space audience.
            </h2>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              Promote conferences, webinars, legal summits, networking events, and professional
              law programs through TLS digital channels and audience networks.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["Event visibility", "Registration support", "Digital campaigns"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 bg-white"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href="/dashboard/TLS-Services/event-promotion"
            className="self-start flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#2563eb" }}
          >
            Promote event <span className="text-base leading-none">→</span>
          </Link>
        </div>

        {/* Right: Figma image */}
        <div className="relative" style={{ minHeight: "220px" }}>
          <img
            src="/servicescard.png"
            alt="Event preview card"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>

      {/* Rejected or refunded promotions send organisers here to arrange
          their refund, so Support has to be one click away. */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <LifeBuoy size={18} className="text-blue-600 shrink-0" />
          <p className="text-[13px] text-gray-600">
            Questions about a payment, a rejected promotion or a refund?
          </p>
        </div>
        <Link
          href="/support"
          className="shrink-0 text-[13px] font-medium text-blue-600 hover:underline"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}