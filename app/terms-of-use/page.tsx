"use client";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const sections = [
  {
    title: "1. About these Terms",
    paragraphs: [
      '1.1 These Terms are a contract between you and The Legal Space Ltd, a company registered in Nigeria with RC number 9583849 ("TLS", "we", "us"). They apply to the website at thelegalspace.com and every service we offer through it (together, the "Platform").',
      "1.2 By creating an account or using the Platform, you agree to these Terms and to our Privacy Policy. If you do not agree, please do not use the Platform.",
      "1.3 The Platform is currently available as a website only. If we release a mobile app, these Terms will apply to it as well.",
    ],
  },
  {
    title: "2. What TLS is, and what it is not",
    paragraphs: [
      "2.1 TLS is a legal technology platform. We help people and businesses find a verified lawyer, and we give lawyers and law firms tools to grow their practice.",
      "2.2 TLS is not a law firm. We do not give legal advice, we do not act for anyone in a legal matter, and nothing on the Platform creates a lawyer and client relationship between you and TLS.",
      "2.3 When a client and a lawyer agree to work together, their relationship and any fees are between them alone. TLS takes no share of any lawyer's legal fees.",
      "2.4 Any advice a lawyer gives is that lawyer's own professional work and responsibility.",
    ],
  },
  {
    title: "3. Who can use TLS",
    paragraphs: [
      "3.1 You must be at least 18 years old and able to enter into a binding contract.",
      "3.2 Lawyers must be called to the Nigerian Bar and entitled to practise. Lawyers must pass our verification process (section 5) before going live.",
      "3.3 A law firm account must be opened by a person who has the firm's authority to accept these Terms on its behalf.",
      "3.4 All information you give us must be true, current and complete. You must update it when it changes.",
    ],
  },
  {
    title: "4. Your account",
    paragraphs: [
      "4.1 You can sign up with an email address and password or with Google Sign In. We confirm your email with a one time code.",
      "4.2 Each person or firm may hold only one active account. Accounts are personal and may not be shared, sold or transferred.",
      "4.3 Account types are Client, Lawyer and Law Firm. Choose the type that truly describes you.",
      "4.4 You are responsible for keeping your login details safe and for everything done through your account. Tell us straight away at support@thelegalspace.com if you think someone else has used your account.",
    ],
  },
  {
    title: "5. Lawyer verification",
    paragraphs: [
      "5.1 Before a lawyer profile goes live, the lawyer must provide:",
    ],
    list: [
      "a valid Call to Bar certificate;",
      "their National Identification Number (NIN), so we can confirm the account belongs to the person on the certificate; and",
      "a liveness check, which confirms that a real person who matches the documents is completing the sign up.",
    ],
    tail: [
      "5.2 Every application is reviewed by a member of our team. No lawyer is approved automatically.",
      "5.3 We may refuse, pause or remove verification if documents cannot be confirmed or later turn out to be false. Submitting false or forged documents will lead to permanent removal and may be reported to the Nigerian Bar Association and the relevant authorities.",
      "5.4 Verification confirms identity and Call to Bar only. It is not a recommendation of any lawyer's skill, experience or suitability for your matter.",
    ],
  },
  {
    title: "6. How matching works",
    paragraphs: [
      "6.1 A client describes their legal need in plain language. TLS then matches the client with one suitable verified lawyer, based on practice area, location and other relevant information on the lawyer's TLS profile.",
      "6.2 Matching only uses lawyers who are verified on TLS and hold an active membership. We do not search the internet for lawyers who are not on TLS.",
      "6.3 Matching is free for clients. Paid advertising and paid features never affect who a client is matched with.",
      "6.4 Matching uses automated tools, including artificial intelligence, to suggest a suitable lawyer. It is a helpful starting point, not a guarantee. The client decides whether to work with the matched lawyer.",
      "6.5 After a match, the client and lawyer can message each other and share files inside the Platform. TLS is not a party to these conversations. We only look at them where needed for safety, security, to investigate a report, or where the law requires it.",
    ],
  },
  {
    title: "7. Memberships and payments",
    paragraphs: [
      "7.1 Lawyer membership and Firm membership unlock features such as a verified profile, client matches, TLS Research and other tools. Current prices and features are shown on the Platform before you pay.",
      "7.2 A Firm membership gives the firm one firm account with a firm profile, more practice areas and extra features. The firm account is managed by one authorised person. Each lawyer at the firm who wants their own profile and matches uses their own individual lawyer account.",
      "7.3 Payments are processed by Paystack. We do not see or store your full card details.",
      "7.4 Automatic renewal. Memberships renew automatically at the end of each billing period (currently every 6 months) at the price then shown, unless you cancel in your account settings before the renewal date. We will remind you before each renewal.",
      "7.5 Price changes. We will give at least 30 days' notice before a new price applies to an existing membership. If you do not want to continue at the new price, you can cancel before your next renewal.",
    ],
  },
  {
    title: "8. Refunds",
    paragraphs: [
      "8.1 Membership fees are not refundable once a billing period has started, including for early cancellation or non use. If you cancel, you keep access until the end of the period you have paid for.",
      "8.2 We will refund you in full if:",
    ],
    list: [
      "you were charged twice for the same thing;",
      "you were charged for something TLS did not provide; or",
      "the law requires a refund.",
    ],
    tail: [
      "8.3 To ask for a refund, email support@thelegalspace.com within 30 days of the charge. Approved refunds go back to your original payment method.",
    ],
  },
  {
    title: "9. AI tools and TLS Research",
    paragraphs: [
      "9.1 TLS Research and other AI tools help with legal research and drafting. They are powered by third party AI services, including Google Gemini.",
      "9.2 AI output can be wrong, incomplete or out of date. It is not legal advice. Always check it against the original law, cases and documents before relying on it. Lawyers remain fully responsible for any work they give to their clients.",
      "9.3 AI credits come with your membership, and you can buy extra credits on the Platform. Credits can be used while your membership is active, have no cash value, and cannot be refunded, sold or transferred. Unused credits end when your membership or account ends.",
      "9.4 Uploaded documents. You may upload documents to TLS Research. You confirm you have the right to do so. Lawyers must make sure uploads are consistent with their duty of confidentiality to their clients, and should remove personal details that are not needed. We process uploads only to answer your request. We do not keep them after your research session and we never use them to train AI models.",
    ],
  },
  {
    title: "10. Advertising and events",
    paragraphs: [
      "10.1 Lawyers, firms and legal organisations may pay to promote their services or list events on the Platform. All paid placements are labelled.",
      "10.2 Adverts must be truthful, lawful and consistent with the Rules of Professional Conduct for Legal Practitioners. We may reject or remove any advert or event that does not meet these standards.",
      "10.3 Advertising fees are not refundable once the advert has started running. If we reject an advert before it runs, we refund the fee in full.",
      "10.4 Event publication fees are not refundable once the event is published. If we cannot confirm an event is genuine and do not publish it, we refund the fee in full.",
    ],
  },
  {
    title: "11. Your content",
    paragraphs: [
      '11.1 You own the content you post or upload, including profiles, posts, articles and messages ("Content").',
      "11.2 You give TLS a limited, non exclusive, royalty free licence to store, display and share your Content only as needed to run the Platform. This licence ends when you delete the Content or your account, subject to our Privacy Policy.",
      "11.3 You promise that your Content is lawful, accurate and does not infringe anyone else's rights.",
    ],
  },
  {
    title: "12. Rules of conduct",
    paragraphs: ["You must not:"],
    list: [
      "give false information or documents, or pretend to be someone else;",
      "use the Platform for anything unlawful or fraudulent;",
      "contact or deal with users outside the Platform to get around matching or membership rules;",
      "post content that is offensive, misleading, defamatory or infringes another person's rights;",
      "send spam or use bots, scrapers or other automated tools on the Platform;",
      "try to access accounts, data or systems you are not allowed to access; or",
      "disrupt or damage the Platform or other users.",
    ],
  },
  {
    title: "13. TLS intellectual property",
    paragraphs: [
      "The TLS name, logo, design, software and materials belong to The Legal Space Ltd or its licensors. You may not copy or use them outside the Platform without our written permission. If you send us feedback or ideas, we may use them without paying you.",
    ],
  },
  {
    title: "14. Third party services",
    paragraphs: [
      "The Platform relies on third party services, including Paystack, Google, Supabase, Vercel and WhatsApp. Your use of those services may also be governed by their own terms. We choose our providers carefully but are not responsible for their services.",
    ],
  },
  {
    title: "15. Disclaimers and limits on our liability",
    paragraphs: [
      '15.1 We work hard to keep the Platform available and secure, but it is provided "as is" and "as available". We do not promise it will always be uninterrupted or error free.',
      "15.2 We are not responsible for the advice, work, conduct or fees of any lawyer, or for any decision a client makes to hire a lawyer.",
      "15.3 We are not liable for indirect or consequential losses, such as loss of profit, business or data.",
      "15.4 Our total liability to you for any claim is limited to the amount you paid TLS in the 6 months before the event that caused the claim.",
      "15.5 Nothing in these Terms limits liability for fraud, for death or personal injury caused by negligence, or any other liability that cannot be limited under Nigerian law.",
    ],
  },
  {
    title: "16. Closing your account",
    paragraphs: [
      "16.1 By you. You can delete your account at any time in your account settings. Fees already paid are handled under section 8.",
      "16.2 By us. We may suspend or close an account, with or without notice, for false documents, serious or repeated breaches of these Terms, repeated verified complaints, misuse of the Platform, or where the law requires it. Where it is safe and lawful, we will tell you why.",
      "16.3 What happens next. Access ends straight away. Your account is deactivated and hidden from other users. We keep some data for set periods for legal, security and dispute purposes, and then delete it permanently, as explained in our Privacy Policy.",
    ],
  },
  {
    title: "17. Disputes",
    paragraphs: [
      "17.1 Between users. TLS is not a party to disputes between clients and lawyers and does not decide them. Users should resolve them directly, through the Nigerian Bar Association, or through the courts. We will review any report that a user broke these Terms.",
      "17.2 With TLS. If you have a complaint about us, email support@thelegalspace.com. We will try to resolve it within 30 days. If we cannot, either side may go to court.",
      "17.3 These Terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Nigeria have jurisdiction.",
    ],
  },
  {
    title: "18. Changes to these Terms",
    paragraphs: [
      "We may update these Terms. For important changes, we will tell you by email or on the Platform at least 14 days before they take effect. If you keep using the Platform after that date, the new Terms apply. If you do not agree, you can close your account.",
    ],
  },
  {
    title: "19. General",
    paragraphs: [
      "19.1 If any part of these Terms is found invalid, the rest stays in force.",
      "19.2 These Terms, our Privacy Policy and any policies we publish on the Platform are the whole agreement between you and TLS about the Platform.",
      "19.3 We may transfer this agreement to a company that takes over the Platform. We will tell you if this happens.",
    ],
  },
  {
    title: "20. Contact us",
    paragraphs: [
      "The Legal Space Ltd (RC 9583849)",
      "Website: thelegalspace.com",
      "Support: support@thelegalspace.com",
      "Privacy: privacy@thelegalspace.com",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] px-5 pb-16 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#E3E1D9] bg-white px-6 py-10 sm:px-10">
          <p className="text-center text-sm font-semibold text-[#2547D0]">
            Effective date: 1 December 2026 | Version 2.0
          </p>
          <h1 className="mt-3 text-center font-dmSans text-4xl font-bold text-[#14140F] sm:text-5xl">
            Terms of Use
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
                    <ol className="list-decimal space-y-2 pl-6 text-[15px] leading-7 text-[#3A3934]">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
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
