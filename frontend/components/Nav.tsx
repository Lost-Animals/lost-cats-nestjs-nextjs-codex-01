'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav className="nav">
      <Link href="/">Listings</Link>
      <Link href="/posts/new">Create Post</Link>
      <Link href="/chip">Chip Lookup</Link>
      <Link href="/threads">Messages</Link>
      <Link href="/login">Login</Link>
    </nav>
  );
}
