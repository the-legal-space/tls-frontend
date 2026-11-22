"use client";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const sections = [
  {
    title: "1. Who we are",
    paragraphs: [
      '1.1 The Legal Space Ltd ("TLS", "we", "us") is a company registered in Nigeria with RC number 9583849. We run the legal technology platform at thelegalspace.com (the "Platform").',
      "1.2 TLS is the data controller for the personal data described in this policy. This means we decide how and why it is used, and we are responsible for protecting it under the Nigeria Data Protection Act 2023 (NDPA).",
      "1.3 Our Data Protection Officer can be reached at privacy@thelegalspace.com.",
      "1.4 This policy covers everyone who uses the Platform: clients, lawyers, law firms and visitors. It does not cover other websites we link to.",
    ],
  },
  {
    title: "2. The data we collect",
    paragraphs: ["From all users:"],
    list: [
      "name, email address, phone number, city and state, and profile photo (optional);",
      "your password, which we store only in scrambled (hashed) form;",
      "payment records: amount, date, plan and Paystack reference. We never see or store full card details;",
      "messages, files, posts, reports and accounts you follow on the Platform; and",
      "support requests you send us.",
    ],
    tail: [
      "From lawyers, for verification and your profile: Call to Bar certificate, year of call and practice details; National Identification Number (NIN); liveness check data; and bio, practice areas, firm name and location.",
      "From law firms: firm name, CAC registration details, business address, contact details and practice areas.",
      "From clients using matching: the description of the legal need you submit.",
      "From TLS Research users: your research questions and any documents you upload.",
      "Collected automatically: device and browser type, IP address, pages visited and session times, using cookies and server logs.",
      "We do not collect Bank Verification Numbers (BVN).",
    ],
  },
  {
    title: "3. How we use your data, and our lawful basis",
    paragraphs: [
      "Create and run your account - Contract",
      "Verify lawyers (Call to Bar, NIN, liveness check, human review) - Contract, legitimate interests, and explicit consent for liveness data",
      "Match clients with one verified lawyer - Contract",
      "Messaging and file sharing - Contract",
      "TLS Research and AI tools - Contract",
      "Billing, renewals and receipts - Contract and legal obligation",
      "Service messages by email, in app and WhatsApp - Contract and legitimate interests",
      "Fraud prevention, security and handling reports - Legitimate interests and legal obligation",
      "Fixing errors and improving the Platform - Legitimate interests",
      "Marketing messages (not currently sent) - Consent",
      "Where we rely on consent, you can withdraw it at any time. This does not affect anything we did before you withdrew it.",
    ],
  },
  {
    title: "4. Identity data: NIN and liveness checks",
    paragraphs: [
      "4.1 We take this data seriously because it is sensitive. We collect it only from lawyers, only to confirm that the person opening the account is the person named on the Call to Bar certificate.",
      "4.2 NIN. We use your NIN only to confirm your identity. It is never shown on your profile or to other users.",
      "4.3 Liveness check. During sign up, you complete a short camera check that confirms a real person matching your documents is present. Face data is personal data that needs extra protection, so we ask for your explicit consent before the check. We use it for this one purpose only. We keep the result of the check, and we keep any image only for as long as set out in section 9.",
      "4.4 Verification checks may be carried out with the help of a specialist identity verification provider, which may only use the data to perform the check for us.",
      "4.5 Access to identity data is limited to the few team members who review verification. Every application is reviewed by a person, and no lawyer is approved automatically.",
    ],
  },
  {
    title: "5. AI, matching and TLS Research",
    paragraphs: [
      "5.1 Matching. When you describe your legal need, our system, which uses AI, compares it with the profiles of verified TLS lawyers and suggests one suitable lawyer. It uses only information on TLS. We do not search the internet for information about you or about lawyers. You decide whether to work with the matched lawyer, so no decision with legal effect is made about you by automated means alone.",
      "5.2 Your description. The description you submit is shared with your matched lawyer so they understand your need. It is stored as part of your conversation with that lawyer. We do not keep a separate history of AI queries.",
      "5.3 TLS Research. Your questions and uploaded documents are sent to our AI provider, Google (Gemini), to produce an answer. We do not keep uploaded documents after your research session. We do not use your questions or documents to train AI models, and we use our AI provider on terms that do not allow it to train on your data.",
      "5.4 Lawyers' duty of confidentiality. If you are a lawyer uploading client material, you are responsible for making sure this is consistent with your professional duties. Please remove personal details that are not needed for your research.",
    ],
  },
  {
    title: "6. Who we share data with",
    paragraphs: [
      "6.1 Other users. A lawyer's public profile shows name, photo, bio, practice areas, year of call, location and firm. NIN and verification documents are never shown. Client details are shared only with the lawyer they are matched with.",
      "6.2 Service providers who help us run the Platform, and who may use the data only on our instructions:",
    ],
    list: [
      "Supabase - database and secure storage",
      "Vercel - website hosting and server logs",
      "Paystack - payment processing",
      "Google - AI services (Gemini) and Google Sign In",
      "Meta (WhatsApp) - service notifications",
      "Identity verification provider - liveness and identity checks",
    ],
    tail: [
      "6.3 Authorities, where the law requires it, and only the minimum needed.",
      "6.4 To protect people, where we believe in good faith that sharing is needed to prevent fraud or harm.",
      "6.5 If TLS is sold or merges with another company, your data may pass to the new owner, who must respect this policy. We will tell you before this happens.",
      "We do not sell your personal data, and we do not share it with advertisers or data brokers.",
    ],
  },
  {
    title: "7. Data sent outside Nigeria",
    paragraphs: [
      "Some of our providers, including Google, Vercel and Supabase, may store or process data outside Nigeria. When this happens, we make sure the transfer is allowed under the NDPA and protected by suitable safeguards, such as contract terms that require the provider to protect your data to the standard Nigerian law expects.",
    ],
  },
  {
    title: "8. How we protect your data",
    paragraphs: [
      "We use encrypted connections (HTTPS), hashed passwords, one time codes, two step verification for our team, role based access, and database rules that stop users from seeing data that is not theirs. No system is completely secure. If a data breach is likely to put your rights at risk, we will report it to the Nigeria Data Protection Commission within 72 hours and tell affected users without undue delay.",
    ],
  },
  {
    title: "9. How long we keep data",
    paragraphs: [
      "When you delete your account, it is deactivated straight away and hidden from other users. We keep some data for a set period so we can deal with disputes, fraud and legal duties. When that period ends, we delete it permanently or make it fully anonymous.",
      "Profile, posts and messages - 2 years",
      "NIN, Call to Bar certificate and liveness data - 12 months",
      "Payment and tax records - 6 years, as Nigerian tax law requires",
      "Server and security logs - Up to 12 months",
      "TLS Research uploads - Not kept after the research session",
      "While your account is open, we keep your data for as long as you have the account. If a dispute or legal claim is ongoing, we may keep the relevant data until it is resolved.",
    ],
  },
  {
    title: "10. Your rights",
    paragraphs: [
      "Under the NDPA you can ask us to:",
    ],
    list: [
      "give you a copy of your data;",
      "correct data that is wrong;",
      "delete your data earlier than the periods in section 9, unless we must keep it by law or for an ongoing dispute;",
      "restrict or object to how we use your data;",
      "send your data to you or another service in a usable format; and",
      "stop using data we hold on the basis of your consent.",
    ],
    tail: [
      "Email privacy@thelegalspace.com. We may need to confirm your identity first. We aim to reply within 15 working days, and always within the time the law allows. If you are not happy with our answer, you can complain to the Nigeria Data Protection Commission (ndpc.gov.ng).",
    ],
  },
  {
    title: "11. Cookies",
    paragraphs: [
      "We use only the cookies needed to keep you logged in, keep the Platform secure, and understand how it performs in anonymous form. You can control cookies in your browser settings. We will ask for your consent before using any cookies that are not essential.",
    ],
  },
  {
    title: "12. Children",
    paragraphs: [
      "TLS is for people aged 18 and over. We do not knowingly collect data from children. If we learn that a child has opened an account, we will close it and delete the data.",
    ],
  },
  {
    title: "13. Messages from us",
    paragraphs: [
      "Service messages about your account, matches, payments and security are part of the service, and security messages cannot be switched off. We do not currently send marketing messages. If we start, we will ask for your consent first, and every message will let you opt out.",
    ],
  },
  {
    title: "14. Changes to this policy",
    paragraphs: [
      "If we make important changes, we will tell you by email or on the Platform before they take effect and update the version and date at the top.",
    ],
  },
  {
    title: "15. Contact us",
    paragraphs: [
      "The Legal Space Ltd (RC 9583849)",
      "Data Protection Officer: privacy@thelegalspace.com",
      "Website: thelegalspace.com",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] px-5 pb-16 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#E3E1D9] bg-white px-6 py-10 sm:px-10">
          <p className="text-center text-sm font-semibold text-[#2547D0]">
            Effective date: 1 December 2026 | Version 2.0
          </p>
          <h1 className="mt-3 text-center font-dmSans text-4xl font-bold text-[#14140F] sm:text-5xl">
            Privacy Policy
          </h1>
          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-dmSans text-xl font-semibold text-[#14140F]">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-7 text-[#3A3934]">
                      {paragraph}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="list-disc space-y-2 pl-6 text-[15px] leading-7 text-[#3A3934]">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.tail?.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-7 text-[#3A3934]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer visible={false} />
    </>
  );
}
