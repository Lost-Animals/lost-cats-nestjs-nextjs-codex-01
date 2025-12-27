'use client';

import { useState } from 'react';
import { apiFetch, apiUpload } from '../../../lib/api';

const postTypes = ['LOST', 'FOUND'] as const;
const eventPrecision = ['EXACT', 'APPROXIMATE'] as const;
const sexOptions = ['MALE', 'FEMALE', 'UNKNOWN'] as const;
const ageOptions = ['KITTEN', 'ADULT', 'SENIOR', 'UNKNOWN'] as const;
const sizeOptions = ['SMALL', 'MEDIUM', 'LARGE', 'UNKNOWN'] as const;
const furOptions = ['SHORT', 'MEDIUM', 'LONG', 'UNKNOWN'] as const;
const patternOptions = ['SOLID', 'TABBY', 'TUXEDO', 'CALICO', 'OTHER', 'UNKNOWN'] as const;
const triState = ['YES', 'NO', 'UNKNOWN'] as const;

export default function NewPostPage() {
  const [status, setStatus] = useState<string>('');
  const [postId, setPostId] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Saving...');

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      type: formData.get('type'),
      title: formData.get('title'),
      description: formData.get('description'),
      event_datetime: formData.get('event_datetime'),
      event_datetime_precision: formData.get('event_datetime_precision'),
      location: {
        latitude: Number(formData.get('latitude')),
        longitude: Number(formData.get('longitude')),
        location_label: formData.get('location_label'),
        accuracy_radius_m: Number(formData.get('accuracy_radius_m'))
      },
      cat_profile: {
        name: formData.get('cat_name') || undefined,
        sex: formData.get('cat_sex'),
        age_group: formData.get('cat_age_group'),
        size: formData.get('cat_size'),
        fur_length: formData.get('cat_fur_length'),
        primary_color: formData.get('primary_color'),
        secondary_color: formData.get('secondary_color') || undefined,
        pattern: formData.get('pattern'),
        distinctive_marks: formData.get('distinctive_marks') || undefined
      },
      chip_number: formData.get('chip_number') || undefined,
      passport_number: formData.get('passport_number') || undefined,
      is_neutered: formData.get('is_neutered') === 'on',
      health_notes: formData.get('health_notes') || undefined,
      found_care_info:
        formData.get('type') === 'FOUND'
          ? {
              is_sheltered: formData.get('found_is_sheltered') || undefined,
              needs_vet: formData.get('found_needs_vet') || undefined
            }
          : undefined
    };

    try {
      const response = await apiFetch<{ id: string }>('/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setPostId(response.id);
      setStatus('Post created. Upload up to 5 photos.');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function handleUpload() {
    if (!postId || !files) {
      setStatus('Select photos first.');
      return;
    }

    setStatus('Uploading...');

    try {
      const uploads = Array.from(files).slice(0, 5).map(async (file) => {
        const data = new FormData();
        data.append('file', file);
        return apiUpload(`/posts/${postId}/photos`, data);
      });
      await Promise.all(uploads);
      setStatus('Upload complete.');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <div className="split">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Create a post</h2>
        <label>
          Type
          <select name="type" defaultValue="LOST">
            {postTypes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Description
          <textarea name="description" maxLength={2000} required />
        </label>
        <label>
          Event date/time
          <input name="event_datetime" type="datetime-local" required />
        </label>
        <label>
          Event precision
          <select name="event_datetime_precision" defaultValue="EXACT">
            {eventPrecision.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location label
          <input name="location_label" required />
        </label>
        <label>
          Latitude
          <input name="latitude" type="number" step="0.000001" required />
        </label>
        <label>
          Longitude
          <input name="longitude" type="number" step="0.000001" required />
        </label>
        <label>
          Accuracy radius (m)
          <input name="accuracy_radius_m" type="number" defaultValue="500" />
        </label>
        <label>
          Cat name
          <input name="cat_name" />
        </label>
        <label>
          Sex
          <select name="cat_sex" defaultValue="UNKNOWN">
            {sexOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Age group
          <select name="cat_age_group" defaultValue="UNKNOWN">
            {ageOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Size
          <select name="cat_size" defaultValue="UNKNOWN">
            {sizeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fur length
          <select name="cat_fur_length" defaultValue="UNKNOWN">
            {furOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Primary color
          <input name="primary_color" required />
        </label>
        <label>
          Secondary color
          <input name="secondary_color" />
        </label>
        <label>
          Pattern
          <select name="pattern" defaultValue="UNKNOWN">
            {patternOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Distinctive marks
          <input name="distinctive_marks" />
        </label>
        <label>
          Chip number
          <input name="chip_number" />
        </label>
        <label>
          Passport number
          <input name="passport_number" />
        </label>
        <label>
          Is neutered
          <input name="is_neutered" type="checkbox" />
        </label>
        <label>
          Health notes
          <textarea name="health_notes" maxLength={2000} />
        </label>
        <label>
          FOUND: Is sheltered?
          <select name="found_is_sheltered" defaultValue="UNKNOWN">
            {triState.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          FOUND: Needs vet?
          <select name="found_needs_vet" defaultValue="UNKNOWN">
            {triState.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Save post
        </button>
        {status ? <div className="notice">{status}</div> : null}
      </form>

      <div className="form">
        <h3>Upload photos</h3>
        <input type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files)} />
        <button className="button secondary" type="button" onClick={handleUpload}>
          Upload photos
        </button>
        <p className="small">Create a post first. Then upload up to 5 photos.</p>
      </div>
    </div>
  );
}
