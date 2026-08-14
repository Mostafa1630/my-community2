
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

function toEmbeddableUrl(url: string) {
  const id = extractYoutubeId(url);
  if (!id) return url;
  const params = new URLSearchParams({
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    fs: "1",
    controls: "1",
    disablekb: "1",
    playsinline: "1",
    showinfo: "0"
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function isYoutubeEmbed(url: string) {
  return extractYoutubeId(url) !== null;
}

export default function VideoPlayer({ url, title }: { url: string; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink shadow-card">
      {isYoutubeEmbed(url) ? (
        <div className="relative h-full w-full overflow-hidden">
          <iframe
            src={toEmbeddableUrl(url)}
            title={title}
            className="absolute left-0 top-0 h-[118%] w-full -translate-y-[9%] border-0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video src={url} title={title} controls className="h-full w-full" />
      )}
    </div>
  );
}
