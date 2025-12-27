import { API_BASE_URL } from '../../../lib/api';
import { ContactForm } from '../contact-client';

interface PostDetail {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  location_label: string;
  event_datetime: string;
  cat_name?: string | null;
  primary_color: string;
  secondary_color?: string | null;
  pattern?: string | null;
  cat_age_group?: string | null;
  cat_fur_length?: string | null;
  photos: { id: string; url?: string | null; thumb_url?: string | null }[];
}

async function getPost(id: string) {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<PostDetail>;
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    return <div className="notice">Post not found.</div>;
  }

  return (
    <div className="split">
      <section className="card">
        <span className="badge">{post.type}</span>
        <h2>{post.title}</h2>
        <p>{post.description}</p>
        <div className="taglist">
          <span className="tag">{post.location_label}</span>
          <span className="tag">{new Date(post.event_datetime).toLocaleString()}</span>
          <span className="tag">{post.primary_color}</span>
          {post.secondary_color ? <span className="tag">{post.secondary_color}</span> : null}
          {post.pattern ? <span className="tag">{post.pattern}</span> : null}
        </div>
        <p className="small">Cat name: {post.cat_name || 'Unknown'}</p>
      </section>
      <section className="card">
        <h3>Photos</h3>
        <div className="media">
          {post.photos.length === 0 ? (
            <div className="notice">No photos.</div>
          ) : (
            post.photos.map((photo) => (
              <img key={photo.id} src={photo.url || ''} alt="Cat photo" />
            ))
          )}
        </div>
      </section>
      <ContactForm postId={post.id} />
    </div>
  );
}
