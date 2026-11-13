// Online leaderboard (Firebase Firestore). Fill these in to switch it on; see docs/LEADERBOARD.md.
// A Firebase web API key is NOT a secret: it only identifies the project. What protects the data is the
// Firestore security rules in docs/LEADERBOARD.md (shape + range checks, no deletes, scores only rise).
// Leave projectId empty and the game keeps local high scores only.
export const LEADERBOARD = {
  projectId: 'trashpanda-trow',
  apiKey: 'AIzaSyChX8_w9ktxvwslej7PSnwmEODWh-KKB50',
  collection: 'scores',
};
