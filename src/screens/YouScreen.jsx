import ProfileScreen from "./ProfileScreen";

// ── YouScreen ──
// Step 2 scaffold: thin pass-through to ProfileScreen so the new "You" tab
// is wired up with the right name and a stable home for the eventual merge.
// LifeStats is already reachable via Settings here. The full merge of the
// old StatsScreen content into a single scrollable You tab lands later.
export default function YouScreen(props) {
  return <ProfileScreen {...props} />;
}
