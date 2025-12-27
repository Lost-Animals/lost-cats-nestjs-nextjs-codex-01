const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const radLat = (lat * Math.PI) / 180;
  const radLng = (lng * Math.PI) / 180;
  const radDist = radiusKm / EARTH_RADIUS_KM;

  const minLat = radLat - radDist;
  const maxLat = radLat + radDist;

  const minLng = radLng - Math.asin(Math.sin(radDist) / Math.cos(radLat));
  const maxLng = radLng + Math.asin(Math.sin(radDist) / Math.cos(radLat));

  return {
    minLat: (minLat * 180) / Math.PI,
    maxLat: (maxLat * 180) / Math.PI,
    minLng: (minLng * 180) / Math.PI,
    maxLng: (maxLng * 180) / Math.PI
  };
}
