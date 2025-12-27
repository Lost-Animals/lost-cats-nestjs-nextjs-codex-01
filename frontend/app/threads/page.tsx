'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

interface ThreadItem {
  id: string;
  created_at: string;
  post: { id: string; title: string; type: 'LOST' | 'FOUND' };
  messages: { body: string; created_at: string }[];
}

export default function ThreadsPage() {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    apiFetch<ThreadItem[]>('/threads')
      .then((data) => {
        setThreads(data);
        setStatus('');
      })
      .catch((error) => setStatus((error as Error).message));
  }, []);

  return (
    <div className="card">
      <h2>Message threads</h2>
      {status ? <div className="notice">{status}</div> : null}
      <div className="grid">
        {threads.map((thread) => (
          <article key={thread.id} className="card">
            <span className="badge">{thread.post.type}</span>
            <h3>{thread.post.title}</h3>
            <p className="small">Last message: {thread.messages[0]?.body || 'No messages yet'}</p>
            <Link href={`/threads/${thread.id}`}>Open thread</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
