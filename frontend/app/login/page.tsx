'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Signing in...');

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      const response = await apiFetch<{ access_token: string; refresh_token?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      window.localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        window.localStorage.setItem('refresh_token', response.refresh_token);
      }
      setStatus('Signed in.');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" required />
      </label>
      <button className="button" type="submit">
        Sign in
      </button>
      {status ? <div className="notice">{status}</div> : null}
    </form>
  );
}
