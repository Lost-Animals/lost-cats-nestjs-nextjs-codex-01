import { API_BASE_URL } from '../lib/api';
import { PostCard } from '../components/PostCard';

interface PostListItem {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  location_label: string;
  event_datetime: string;
  photos: { thumb_url?: string | null; url?: string | null }[];
}

async function getPosts() {
  const response = await fetch(`${API_BASE_URL}/posts`, { cache: 'no-store' });
  if (!response.ok) {
    return { items: [] as PostListItem[] };
  }
  return response.json() as Promise<{ items: PostListItem[] }>;
}

export default async function HomePage() {
  const data = await getPosts();

  return (
    <div>
      <section className="hero">
        <h1>Bring them home with safe, trusted listings.</h1>
        <p>
          Browse lost and found cats, filter by location, and reach out through the platform without exposing personal
          details.
        </p>
        <div className="taglist">
          <span className="tag">LOST</span>
          <span className="tag">FOUND</span>
          <span className="tag">Chip lookup</span>
          <span className="tag">Private contact</span>
        </div>
      </section>

      <section className="grid">
        {data.items.length === 0 ? (
          <div className="notice">No posts yet. Create the first listing.</div>
        ) : (
          data.items.map((post) => <PostCard key={post.id} {...post} />)
        )}
      </section>
    </div>
  );
}
