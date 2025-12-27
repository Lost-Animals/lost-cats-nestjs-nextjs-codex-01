import Link from 'next/link';

export interface PostCardProps {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  location_label: string;
  event_datetime: string;
  photos?: { thumb_url?: string | null; url?: string | null }[];
}

export function PostCard({ id, type, title, description, location_label, event_datetime, photos }: PostCardProps) {
  const cover = photos && photos.length > 0 ? photos[0].thumb_url || photos[0].url : null;

  return (
    <article className="card">
      <span className="badge">{type}</span>
      <div className="media">
        {cover ? <img src={cover} alt={title} /> : <div className="notice">No photo</div>}
      </div>
      <h3>{title}</h3>
      <p>{description.length > 120 ? `${description.slice(0, 120)}...` : description}</p>
      <footer>
        <span>{location_label}</span>
        <Link href={`/posts/${id}`}>Open</Link>
      </footer>
      <div className="small">{new Date(event_datetime).toLocaleString()}</div>
    </article>
  );
}
