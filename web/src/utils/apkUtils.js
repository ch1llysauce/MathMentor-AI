/**
 * Utility to handle APK file download cleanly across browsers and platforms.
 */
export function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return /FBAN|FBAV|Instagram|Messenger|FB_IAB|FB4A|Line|Viber|TikTok/i.test(ua);
}

export function handleApkDownload(e, apkUrl = import.meta.env.VITE_APK_DOWNLOAD_URL || '/MathMentorAI.apk') {
  if (e && e.preventDefault) e.preventDefault();

  const targetUrl = apkUrl && apkUrl.trim() !== '' ? apkUrl : '/MathMentorAI.apk';

  // If inside Messenger/FB In-App Browser
  if (isInAppBrowser()) {
    window.location.href = targetUrl;
    return;
  }

  // Handle external download links (e.g. Google Drive, MediaFire, GitHub Release)
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Local static file
    const absoluteUrl = new URL(targetUrl, window.location.origin).href;
    const link = document.createElement('a');
    link.href = absoluteUrl;
    link.download = 'MathMentor-AI.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

