'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function RegisterPage() {
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Creating account...');

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
      display_name: formData.get('display_name')
    };

    try {
      const response = await apiFetch<{ access_token: string; refresh_token?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      window.localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        window.localStorage.setItem('refresh_token', response.refresh_token);
      }
      setStatus('Account created.');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      <label>
        Display name
        <input name="display_name" required />
      </label>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" minLength={8} required />
      </label>
      <button className="button" type="submit">
        Register
      </button>
      {status ? <div className="notice">{status}</div> : null}
    </form>
  );
}
