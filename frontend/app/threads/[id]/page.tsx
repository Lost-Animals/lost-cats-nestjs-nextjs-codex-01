'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

interface Message {
  id: string;
  body: string;
  created_at: string;
  sender_user_id: string;
}

export default function ThreadDetailPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    apiFetch<Message[]>(`/threads/${params.id}/messages`)
      .then((data) => {
        setMessages(data);
        setStatus('');
      })
      .catch((error) => setStatus((error as Error).message));
  }, [params.id]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Sending...');

    try {
      const message = await apiFetch<Message>(`/threads/${params.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body })
      });
      setMessages((prev) => [...prev, message]);
      setBody('');
      setStatus('');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <div className="split">
      <div className="card">
        <h2>Thread</h2>
        {messages.length === 0 ? <div className="notice">No messages yet.</div> : null}
        <div className="media">
          {messages.map((message) => (
            <div key={message.id} className="card">
              <p>{message.body}</p>
              <div className="small">{new Date(message.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <form className="form" onSubmit={handleSend}>
        <h3>Send message</h3>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} required />
        <button className="button" type="submit">
          Send
        </button>
        {status ? <div className="notice">{status}</div> : null}
      </form>
    </div>
  );
}
