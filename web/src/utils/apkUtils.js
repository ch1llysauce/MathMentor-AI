/**
 * Utility to handle APK file download by cleanly opening in a new browser tab.
 */
export function handleApkDownload(e, apkUrl = import.meta.env.VITE_APK_DOWNLOAD_URL || '/MathMentorAI.apk') {
  if (e && e.preventDefault) e.preventDefault();
  const absoluteUrl = new URL(apkUrl, window.location.origin).href;
  window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
}
