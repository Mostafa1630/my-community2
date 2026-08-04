// Local mock lesson URLs are already in youtube.com/embed/{id} form; the real
// backend's lesson URLs are plain youtu.be/{id} or youtube.com/watch?v={id}
// share links instead — extract the video id from whichever form shows up
// rather than assuming one.
function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const match = u.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
      if (match) return match[2];
    }
  } catch {
    return null;
  }
  return null;
}

// YouTube doesn't expose an official parameter to remove the "Share" icon from the
// control bar, but switching to the privacy-enhanced domain plus these params strips
// almost everything else around the video itself: no end-screen suggested videos from
// other channels, no annotations, and a muted branding/title watermark.
function toEmbeddableUrl(url: string) {
  const id = extractYoutubeId(url);
  if (!id) return url;
  return `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&iv_load_policy=3&fs=1`;
}

function isYoutubeEmbed(url: string) {
  return extractYoutubeId(url) !== null;
}

export default function VideoPlayer({ url, title }: { url: string; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink shadow-card">
      {isYoutubeEmbed(url) ? (
        <iframe
          src={toEmbeddableUrl(url)}
          title={title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={url} title={title} controls className="h-full w-full" />
      )}
    </div>
  );
}
