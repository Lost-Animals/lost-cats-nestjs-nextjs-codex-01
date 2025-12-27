'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export function ContactForm({ postId }: { postId: string }) {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Sending...');

    try {
      await apiFetch(`/posts/${postId}/contact`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      setStatus('Message sent.');
      setMessage('');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Contact via platform</h3>
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} required />
      <button className="button" type="submit">
        Send message
      </button>
      {status ? <div className="notice">{status}</div> : null}
    </form>
  );
}
