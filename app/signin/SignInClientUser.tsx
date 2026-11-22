// app/signin/SignInClientUser.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthError, useAuth } from "../context/AuthContext";
import Image from "next/image";
// Save your illustration here (rename if needed):
import signinIllustration from "../../public/signin-illustration.jpg";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import WaitlistPlaceholder from "../Components/WaitlistPlaceholder";

declare const google: any;

const GOOGLE_BTN_MIN_WIDTH = 200;
const GOOGLE_BTN_MAX_WIDTH = 1200;

/**
 * Whether the sign-in page shows the waitlist variant.
 *
 * The `NEXT_PUBLIC_` prefix is required: Next.js only inlines env vars with
 * that prefix into the client bundle, so a bare `WAILTLIST` check would always
 * be `undefined` here and the waitlist branch would never render.
 */
const WAITLIST_ENABLED = ["true", "1"].includes(
  process.env.NEXT_PUBLIC_WAITLIST?.trim().toLowerCase() ?? "",
);

export default function SignInClientUser() {
  const { loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  // Wrapper we measure to size the real Google button in real pixels.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Real Google button — rendered directly over the visible custom button
  const googleButtonRef = useRef<HTMLDivElement>(null);
  // Second Google button overlaying the "Sign up" link
  const googleSignUpButtonRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleReady, setGoogleReady] = useState<boolean>(false);
  // Bumped whenever the tab regains focus, forcing the Google button
  // wrapper to remount with a brand-new iframe.
  const [resetKey, setResetKey] = useState(0);
  // Google only accepts a fixed pixel width, not "100%". We track the wrapper's
  // width to size the invisible real button underneath.
  const [btnWidth, setBtnWidth] = useState(400);
  const [scaleX, setScaleX] = useState(1);

  const callbackError = searchParams.get("error");

  // 1. Initialise Google Identity once the script is available
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof google === "undefined") return;
      clearInterval(interval);

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        cancel_on_tap_outside: false,
        callback: async (resp: { credential: string }) => {
          setIsLoading(true);
          setError("");
          try {
            const base64 = resp.credential
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));

            const fullName: string =
              payload.name ??
              `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim();

            const avatarUrl: string | undefined = payload.picture ?? undefined;

            await loginWithGoogle(resp.credential, fullName, avatarUrl);
          } catch (err: unknown) {
            const authErr = err as AuthError;
            setError(
              authErr?.message ?? "Google sign in failed. Please try again.",
            );
          } finally {
            setIsLoading(false);
          }
        },
      });

      setGoogleReady(true);
    }, 100);

    return () => clearInterval(interval);
  }, [loginWithGoogle]);

  // 2. Measure the wrapper's real width
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const width = Math.round(el.getBoundingClientRect().width);
      if (width > 400) {
        setBtnWidth(400);
        setScaleX(width / 400);
      } else {
        const clamped = Math.min(400, Math.max(GOOGLE_BTN_MIN_WIDTH, width));
        setBtnWidth((prev) => (prev === clamped ? prev : clamped));
        setScaleX(1);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3. Render the REAL Google buttons
  useEffect(() => {
    if (!googleReady) return;
    const el = googleButtonRef.current;
    const signUpEl = googleSignUpButtonRef.current;
    if (typeof google === "undefined") return;

    if (el) {
      el.innerHTML = "";
      google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: btnWidth,
      });
    }

    if (signUpEl) {
      signUpEl.innerHTML = "";
      google.accounts.id.renderButton(signUpEl, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "rectangular",
        width: 200, // Smallest width allowed by Google, scaled to cover via absolute & css
      });
    }
  }, [googleReady, resetKey, btnWidth]);

  // 4. If the tab regains focus, remount the buttons
  useEffect(() => {
    const handleFocus = () => {
      if (!isLoading) {
        setResetKey((k) => k + 1);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLoading]);

  // 5. Fallback trigger
  const triggerGoogle = () => {
    if (typeof google === "undefined" || !googleReady) return;
    google.accounts.id.prompt();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-black">
      <Navbar />

      {/* Main content area — vertically centered */}
      <main className="flex-1 w-full flex items-center pb-0">
        <div className="w-full mx-auto mt-16 lg:mt-0   md:mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-2">
            {/* Illustration — desktop only */}
            <div className="hidden lg:block">
              <Image
                src={signinIllustration}
                alt="The Legal Space community illustration"
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Sign-in content */}
            {WAITLIST_ENABLED ? (
              <WaitlistPlaceholder variant="user" />
            ) : (
              <div className="w-full px-8 md:px-20 text-left">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3 leading-tight font-dmSans">
                  Welcome to The Legal Space
                </h1>
                <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed font-dmSans">
                  Access legal support, professional insights, and trusted
                  connections all in one place.
                </p>

                {/* Errors */}
                {(callbackError || error) && (
                  <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-[13px] text-red-600 font-dmSans">
                      {error ||
                        (callbackError === "google_failed"
                          ? "Google sign in failed. Please try again."
                          : "Something went wrong. Please try again.")}
                    </p>
                  </div>
                )}

                {/* Custom button / loading */}
                {isLoading ? (
                  <div className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl text-center">
                    <p className="text-[14px] text-gray-600 font-dmSans">
                      Signing you in…
                    </p>
                  </div>
                ) : (
                  <div ref={wrapperRef} className="relative w-full">
                    <div
                      key={resetKey}
                      ref={googleButtonRef}
                      aria-hidden
                      className="absolute inset-y-0 left-0 z-10 opacity-0 overflow-hidden h-full [&_div]:w-full! [&_div]:h-full! [&_iframe]:w-full! [&_iframe]:h-full!"
                      style={{
                        width: `${btnWidth}px`,
                        transform: `scaleX(${scaleX})`,
                        transformOrigin: "left",
                      }}
                    />
                    <button
                      type="button"
                      disabled={!googleReady}
                      className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-700 shadow-sm transition hover:bg-white active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed font-dmSans"
                    >
                      <GoogleIcon />
                      Sign in with Google
                    </button>
                  </div>
                )}

                {/* Account link */}
                <p className="mt-6 text-center text-sm text-gray-600 font-dmSans">
                  Don&apos;t have an account?{" "}
                  <span className="relative inline-block align-baseline">
                    <span
                      key={`signup-${resetKey}`}
                      ref={googleSignUpButtonRef}
                      aria-hidden
                      className="absolute inset-0 z-10 opacity-0 overflow-hidden w-full h-full [&_div]:w-full! [&_div]:h-full! [&_iframe]:w-full! [&_iframe]:h-full!"
                    />
                    <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                      Sign up
                    </span>
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer visible={false} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
