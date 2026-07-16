// YouTube doesn't expose an official parameter to remove the "Share" icon from the
// control bar, but switching to the privacy-enhanced domain plus these params strips
// almost everything else around the video itself: no end-screen suggested videos from
// other channels, no annotations, and a muted branding/title watermark.
function toEmbeddableUrl(url: string) {
  if (!/youtube\.com\/embed\//.test(url)) return url;
  const withPrivacyDomain = url.replace("www.youtube.com", "www.youtube-nocookie.com");
  const separator = withPrivacyDomain.includes("?") ? "&" : "?";
  return `${withPrivacyDomain}${separator}modestbranding=1&rel=0&iv_load_policy=3&fs=1`;
}

export default function VideoPlayer({ url, title }: { url: string; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink shadow-card">
      <iframe
        src={toEmbeddableUrl(url)}
        title={title}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
