// src/lib/mateSuggestions.js
// Suggestions engine for mate recommendations
// See Mates.jsx for usage and scoring logic

// Haversine distance in km between two lat/lng points
export function haversineKm(lat1, lng1, lat2, lng2) {
  if (
    lat1 == null ||
    lng1 == null ||
    lat2 == null ||
    lng2 == null ||
    isNaN(lat1) ||
    isNaN(lng1) ||
    isNaN(lat2) ||
    isNaN(lng2)
  )
    return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Main suggestion builder
// Params:
// - me: current user profile
// - candidates: array of candidate profiles
// - myMates: array of accepted mate profiles
// - myRecentSports: array of sports strings
// - mutualMap: { [candidateId]: mutualCount }
// - candidateStats: { [candidateId]: { recentSports, recentActivity, lastActive, venuesNearby } }
// Returns: array of { profile, score, reasons, metrics }
export function buildMateSuggestions({
  me,
  candidates,
  myRecentSports,
  mutualMap,
  candidateStats,
}) {
  const myLat = me.city_lat;
  const myLng = me.city_lng;
  const myCity = me.city ? me.city.trim().toLowerCase() : null;

  return candidates
    .map((cand) => {
      let score = 0;
      const reasons = [];
      const metrics = {};
      // --- A) Location proximity ---
      let locScore = 0;
      let distKm = null;
      if (myLat && myLng && cand.city_lat && cand.city_lng) {
        distKm = haversineKm(myLat, myLng, cand.city_lat, cand.city_lng);
        metrics.distanceKm = distKm;
        if (distKm <= 5) {
          locScore = 40;
          reasons.push("Near you");
        } else if (distKm <= 15) {
          locScore = 30;
          reasons.push("Nearby");
        } else if (distKm <= 50) {
          locScore = 15;
          reasons.push("Same region");
        }
      } else if (
        myCity &&
        cand.city &&
        cand.city.trim().toLowerCase() === myCity
      ) {
        locScore = 10;
        reasons.push("Same city");
      }
      score += locScore;
      metrics.locScore = locScore;

      // --- B) Favorite sports overlap ---
      let sportsScore = 0;
      let sharedSports = [];
      if (
        Array.isArray(me.favorite_sports) &&
        Array.isArray(cand.favorite_sports)
      ) {
        sharedSports = me.favorite_sports.filter((s) =>
          cand.favorite_sports.includes(s)
        );
        if (sharedSports.length === 1) {
          sportsScore = 15;
          reasons.push("1 shared sport");
        } else if (sharedSports.length === 2) {
          sportsScore = 25;
          reasons.push("2 shared sports");
        } else if (sharedSports.length >= 3) {
          sportsScore = 35;
          reasons.push(`${sharedSports.length} shared sports`);
        }
      }
      score += sportsScore;
      metrics.sportsScore = sportsScore;
      metrics.sharedSports = sharedSports;

      // --- C) Activity behavior overlap ---
      let actScore = 0;
      const stats = candidateStats[cand.id] || {};
      // Same sport participation/creation
      if (Array.isArray(stats.recentSports) && stats.recentSports.length > 0) {
        const overlap = myRecentSports.filter((s) =>
          stats.recentSports.includes(s)
        );
        if (overlap.length > 0) {
          actScore += 10;
          reasons.push("Similar activity interests");
        }
      }
      // Same venue proximity
      if (Array.isArray(stats.venuesNearby) && stats.venuesNearby.length > 0) {
        actScore += 10;
        reasons.push("Plays near you");
      }
      score += actScore;
      metrics.actScore = actScore;

      // --- D) Mates-of-mates ---
      let mutualCount = mutualMap[cand.id] || 0;
      let mutualScore = 0;
      if (mutualCount > 0) {
        mutualScore = 20;
        reasons.push(`${mutualCount} mutual mate${mutualCount > 1 ? "s" : ""}`);
      }
      score += mutualScore;
      metrics.mutualScore = mutualScore;
      metrics.mutualCount = mutualCount;

      // --- E) Recency/activity level ---
      let recencyScore = 0;
      if (
        stats.lastActive &&
        Date.now() - new Date(stats.lastActive).getTime() <
          14 * 24 * 60 * 60 * 1000
      ) {
        recencyScore = 5;
        reasons.push("Active this week");
      }
      score += recencyScore;
      metrics.recencyScore = recencyScore;

      return {
        profile: cand,
        score,
        reasons,
        metrics,
      };
    })
    .sort((a, b) => b.score - a.score);
}
