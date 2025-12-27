'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { PostCard } from '../../components/PostCard';

interface PostItem {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  location_label: string;
  event_datetime: string;
  photos: { thumb_url?: string | null; url?: string | null }[];
}

export default function ChipLookupPage() {
  const [chipNumber, setChipNumber] = useState('');
  const [results, setResults] = useState<PostItem[]>([]);
  const [status, setStatus] = useState('');

  async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Searching...');

    try {
      const posts = await apiFetch<PostItem[]>(`/chip/${chipNumber}`);
      setResults(posts);
      setStatus(posts.length === 0 ? 'No active posts found.' : 'Results loaded.');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <div className="split">
      <form className="form" onSubmit={handleLookup}>
        <h2>Chip lookup</h2>
        <label>
          Microchip number
          <input value={chipNumber} onChange={(event) => setChipNumber(event.target.value)} required />
        </label>
        <button className="button" type="submit">
          Search
        </button>
        {status ? <div className="notice">{status}</div> : null}
      </form>
      <div>
        <div className="grid">
          {results.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
