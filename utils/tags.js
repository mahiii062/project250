export function buildSellerTags({ avg_rating = 0, rating_count = 0, distance_km = null }) {
const tags = [];
const ar = Number(avg_rating) || 0;
const rc = Number(rating_count) || 0;
const d = distance_km == null ? null : Number(distance_km);


if (ar >= 4.7 && rc >= 20) tags.push('Top Rated');
else if (ar >= 4.3) tags.push('Highly Rated');
if (rc >= 100) tags.push('Popular');
else if (rc >= 25) tags.push('Rising Star');
if (d != null) {
if (d <= 2) tags.push('Nearby');
else if (d <= 5) tags.push('Close By');
}
return tags;
}