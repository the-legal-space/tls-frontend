// lib/signedDocument.ts
//
// Document URLs from the API (research PDFs, KYC documents, SCN dispute
// evidence) are signed links that expire 15 minutes after they were issued.
// Rules from the backend:
//   - fetch a fresh link only when the user is about to open the document
//   - use the `url` field exactly as returned, never build or edit it
//   - never persist it (local storage, long-lived state, bookmarkable places)
//
// openSignedDocument() follows that: the caller passes a function that
// refetches the owning resource and returns the url, so the tab always opens
// a link minted a moment ago and an expired link (401) is never shown.

/**
 * Opens a signed document link in a new tab.
 *
 * The tab is opened synchronously, inside the click handler, so popup
 * blockers allow it; it is pointed at the fresh link once the refetch
 * resolves. If no link can be fetched, the blank tab is closed again.
 */
export async function openSignedDocument(
  getFreshUrl: () => Promise<string | null | undefined>,
): Promise<boolean> {
  const tab = window.open("", "_blank");
  try {
    const url = await getFreshUrl();
    if (!url) {
      tab?.close();
      return false;
    }
    if (tab) {
      // Cut the link back to this page before navigating to the document.
      tab.opener = null;
      tab.location.href = url;
    } else {
      // Popup was blocked anyway: fall back to the current tab.
      window.location.assign(url);
    }
    return true;
  } catch {
    tab?.close();
    return false;
  }
}

/**
 * How often a page that keeps a signed link on screen (e.g. an iframe
 * preview) should refetch it. Links expire after 15 minutes; refreshing at
 * 12 leaves headroom for slow networks and clock skew.
 */
export const SIGNED_URL_REFRESH_MS = 12 * 60 * 1000;
