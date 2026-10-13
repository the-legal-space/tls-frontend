"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { usePathname, useRouter } from "next/navigation";

// import the images
import x from "@/public/x.png";
import insta from "@/public/insta.png";
import tiktok from "@/public/tiktok.png";
import link from "@/public/link.png";
import face from "@/public/face.png";

const faqs = [
  {
    icon: "❤️",
    q: "Is The Legal Space free to use?",
    a: "Yes. Individuals can explore resources and connect with legal professionals at no cost.",
  },
  {
    icon: "🔍",
    q: "How do I Find a Lawyer?",
    a: "Simply describe your legal matter to TLS AI. Based on your needs, practice area, location, and other relevant factors, we help connect you with suitable lawyers.",
  },
  {
    icon: "⚖️",
    q: "How can lawyers join The Legal Space?",
    a: "Lawyers and law firms can sign up for the platform with a paid membership that gives them access to cool tools, better visibility, and plenty of opportunities.",
  },
  {
    icon: "🔒",
    q: "Is my information kept private?",
    a: "Yes. Your privacy is important to us. You remain in control of your information and can decide when and how to share personal details.",
  },
  {
    icon: "📄",
    q: "Are all lawyers on the platform verified?",
    a: "Yes. Legal professionals undergo a verification process before being approved on the platform.",
  },
];

interface FooterProps {
  visible?: boolean;
}

export default function Footer({ visible = true }: FooterProps) {
  const router = useRouter();
  const usePathName = usePathname();

  const scrollToSection = (href: string) => {
    const id = href.replace("#", "");
    if (usePathName !== "/") {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 90,
      behavior: "smooth",
    });
  };
  return (
    <>
      {/* FAQ Section */}
      {visible && (
        <section
          id="faqs"
          className="max-w-360  mx-auto py-24 bg-white px-4 sm:px-8 lg:px-16 xl:px-0 section-alignment"
        >
          <p className="text-[12px] font-semibold tracking-[2px] uppercase text-[#1A56DB] ">
            SUPPORT
          </p>
          <h2 className="font-['Instrument_Serif']  text-[36px] italic tracking-[2px] text-gray-900 ">
            Frequently asked questions
          </h2>

          <p className="text-sm text-gray-400 mb-10">
            Find answers to common questions about finding legal professionals,
            joining the platform, and accessing resources.
          </p>

          <div className=" grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className=" "
            >
              <Image src="/faq.png" alt="FAQ" width={1000} height={1000} />
            </motion.div>

            {/* Questions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ul className="divide-y divide-[#E5E7EB]">
                {faqs.map((faq, i) => (
                  <motion.li
                    key={faq.q}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="py-5"
                  >
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-base shrink-0">
                        {faq.icon}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold mb-1.5">
                          {faq.q}
                        </p>
                        <p className="text-[14px] text-gray-500 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>
      )}
      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] px-4 sm:px-8 lg:px-16 pt-16 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-12 mb-12">
            {/* Brand */}
            <div>
              <Image
                src="/logo.png"
                alt="The Legal Space"
                width={120}
                height={32}
                className="h-8 w-auto mb-4"
              />
              <p className="text-[14px] text-gray-400 leading-relaxed max-w-50 mb-2">
                Connecting legal professionals, legal knowledge, and opportunity
                through one trusted network.
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                8B Chris Alli Crescent, Ikoyi, Lagos State, Nigeria
              </p>
              <p className="text-[12px] text-gray-300 italic mt-3">Est. 2026</p>
            </div>

            {/* Explore */}
            <div>
              <h5 className="text-[13px] font-semibold text-gray-900 mb-4">
                Explore
              </h5>
              <ul className="space-y-3">
                {[
                  ["About", "#about"],
                  ["How It Works", "#how-it-works"],
                  ["Resources", "#resources"],
                  ["Testimonials", "#testimonials"],
                  ["FAQ's", "#faqs"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <button
                      onClick={() => scrollToSection(href)}
                      className="text-[14px] text-gray-400 hover:text-[#1A56DB] transition-colors"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="text-[13px] font-semibold text-gray-900 mb-4">
                Legal
              </h5>
              <ul className="space-y-3">
                {[
                  "Privacy Policy",
                  "Terms of Services",
                  "Membership Terms",
                  "Verification Policy",
                  "Contact Support",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href={
                        item === "Contact Support"
                          ? "/support"
                          : item === "Privacy Policy"
                            ? "/privacy-policy"
                            : item === "Terms of Services"
                              ? "/terms-of-use"
                              : item === "Membership Terms"
                                ? "/membership-terms"
                                : item === "Verification Policy"
                                  ? "/verification-policy"
                                  : "#"
                      }
                      className="text-[14px] text-gray-400 hover:text-[#1A56DB] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h5 className="text-[13px] font-semibold text-gray-900 mb-4">
                Socials
              </h5>
              <ul className="space-y-3">
                {[
                  {
                    name: "Instagram",
                    href: "https://www.instagram.com/thelegalspace_/",
                  },
                  {
                    name: "X (Twitter)",
                    href: "https://x.com/thelegalspace",
                  },
                  {
                    name: "TikTok",
                    href: "https://www.tiktok.com/@thelegalspace",
                  },
                  {
                    name: "LinkedIn",
                    href: "https://www.linkedin.com/company/the-legal-space-ltd/",
                  },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-[14px] text-gray-400 hover:text-[#1A56DB] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="text-[15px] font-semibold text-gray-900 mb-2">
                Stay Connected To The Legal Community
              </h5>
              <p className="text-[13.5px] text-gray-400 leading-relaxed mb-4">
                Get the latest articles, events, opportunities, and updates from
                The Legal Space delivered directly to your inbox.
              </p>
              <div className="flex border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:border-[#1A56DB] transition-colors">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2.5 text-sm outline-none font-['Inter']"
                />
                <button className="bg-[#1A56DB] text-white px-4 py-2.5 text-[13px] font-medium hover:bg-[#1648b8] transition-colors whitespace-nowrap">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div id="footer-socials" className="border-t border-[#E5E7EB] py-5 flex items-center justify-between">
            <p className="text-[13px] text-gray-400">
              © 2026 The Legal Space. All rights reserved.
            </p>
            <div className="flex gap-2">
              {[
                {
                  icon: insta,
                  label: "Instagram",
                  link: "https://www.instagram.com/thelegalspace_/",
                },
                {
                  icon: x,
                  label: "X (Twitter)",
                  link: "https://x.com/thelegalspace",
                },
                {
                  icon: tiktok,
                  label: "TikTok",
                  link: "https://www.tiktok.com/@thelegalspace",
                },
                {
                  icon: link,
                  label: "LinkedIn",
                  link: "https://www.linkedin.com/company/the-legal-space-ltd/",
                },
              ].map(({ icon, label, link }) => (
                <Link
                  key={label}
                  href={link ? link : "#"}
                  aria-label={label}
                  target={link.startsWith("http") ? "_blank" : undefined}
                  rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-sm hover:border-[#1A56DB] hover:bg-[#E8F0FE] transition-all"
                >
                  <Image src={icon} alt={label} width={20} height={20} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
