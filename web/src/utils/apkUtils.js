/**
 * Utility to handle APK file download cleanly across desktop, mobile browsers,
 * and mobile In-App Browsers (Facebook, Messenger, Instagram, TikTok, Viber, etc.).
 */
export function handleApkDownload(e, apkUrl = import.meta.env.VITE_APK_DOWNLOAD_URL || '/MathMentorAI.apk') {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // Check if opened inside an embedded In-App Browser (WebView)
  const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|Viber|Line|MicroMessenger|TikTok/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // Compute absolute URL for the APK file
  const absoluteUrl = new URL(apkUrl, window.location.origin).href;

  if (isInAppBrowser && isAndroid) {
    // Prevent default direct link behavior inside restricted WebViews
    if (e && e.preventDefault) e.preventDefault();

    // Use Android Intent scheme to force opening directly in Chrome / default browser
    const cleanUrl = absoluteUrl.replace(/^https?:\/\//, '');
    const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;

    // Attempt intent redirect to system Chrome browser
    window.location.href = intentUrl;

    // Fallback: If intent is blocked or not installed, open in new window
    setTimeout(() => {
      window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
    }, 500);
    return;
  }

  // Fallback for in-app browsers on iOS or other platforms
  if (isInAppBrowser) {
    if (e && e.preventDefault) e.preventDefault();
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  }
}
