import { nairobiHour, nairobiMonth } from './nairobi';
import { ActivityHint, Advisory, MarineSnapshot, SeaMood, SeaStory } from './types';

export function tellSeaStory(snapshot: MarineSnapshot, advisory: Advisory): SeaStory {
  const mood = moodFrom(advisory, snapshot);
  const waves = waveLine(snapshot.waveHeightM);
  const wind = windLine(snapshot.windKmh);
  const water = waterLine(snapshot.sstC);
  return {
    mood,
    headline: headlineFor(mood),
    swahili: swahiliFor(mood),
    blurb: blurbFor(mood, waves, water),
    waves,
    wind,
    water,
    activities: activitiesFor(snapshot, advisory),
  };
}

function moodFrom(advisory: Advisory, snapshot: MarineSnapshot): SeaMood {
  if (advisory.tone === 'danger' || advisory.tone === 'poor') {
    return 'rough';
  }
  const waves = snapshot.waveHeightM;
  const wind = snapshot.windKmh;
  const jumpy = waves !== null && waves >= 1.3;
  const windy = wind !== null && wind >= 28;
  if (jumpy || windy) {
    return 'restless';
  }
  if (advisory.tone === 'good') {
    return 'kind';
  }
  return 'restless';
}

function headlineFor(mood: SeaMood): string {
  if (mood === 'kind') {
    return 'The sea is being kind';
  }
  if (mood === 'restless') {
    return 'The ocean is in a mood';
  }
  return 'Better from the sand today';
}

function swahiliFor(mood: SeaMood): string {
  if (mood === 'kind') {
    return 'Bahari ni shwari';
  }
  if (mood === 'restless') {
    return 'Bahari inachachamaa';
  }
  return 'Kaa pwani leo';
}

function blurbFor(mood: SeaMood, waves: string, water: string): string {
  if (mood === 'kind') {
    return `${waves} ${water} A good stretch for a walk, a swim close to shore, or a slow boat.`;
  }
  if (mood === 'restless') {
    return `${waves} Fine for the beach. Stay close to shore if you go out.`;
  }
  return `${waves} Leave the boats. Take chai, watch the dhows, come back when she’s quieter.`;
}

function waveLine(metres: number | null): string {
  if (metres === null) {
    return 'Wave size unknown.';
  }
  if (metres < 0.4) {
    return 'Almost like a quiet creek — ankle-high.';
  }
  if (metres < 0.8) {
    return 'Knee-high waves. Playful and gentle.';
  }
  if (metres < 1.3) {
    return 'About waist-high. You’ll get splashed.';
  }
  if (metres < 1.8) {
    return 'Chest-high. Boats will bounce.';
  }
  return 'Big waves today — best watched from the beach.';
}

function windLine(kmh: number | null): string {
  if (kmh === null) {
    return 'Wind unknown.';
  }
  if (kmh < 12) {
    return 'Barely a breath.';
  }
  if (kmh < 18) {
    return 'A kind breeze. Hats can stay on.';
  }
  if (kmh < 28) {
    return 'Breezy — kites would like this, light boats less so.';
  }
  if (kmh < 40) {
    return 'Wind that snatches voices. Stay close to shore.';
  }
  return 'The kind of wind that sends chairs rolling.';
}

function waterLine(celsius: number | null): string {
  if (celsius === null) {
    return 'Water temperature unknown.';
  }
  if (celsius >= 28) {
    return 'The water is bath-warm.';
  }
  if (celsius >= 26) {
    return 'The water is pleasantly warm.';
  }
  if (celsius >= 24) {
    return 'The water is comfortably cool.';
  }
  return 'The water is cooler than most people like.';
}

function activitiesFor(snapshot: MarineSnapshot, advisory: Advisory): ActivityHint[] {
  const waves = snapshot.waveHeightM;
  const wind = snapshot.windKmh;
  const rough = advisory.tone === 'danger' || advisory.tone === 'poor';
  const jumpy = waves !== null && waves >= 1.3;
  const windy = wind !== null && wind >= 28;
  const hints: ActivityHint[] = [
    { id: 'beach', label: 'Beach walk', ok: true },
    { id: 'swim', label: 'Swim near shore', ok: !rough && !jumpy && !windy },
    { id: 'boat', label: 'Small boat', ok: advisory.go && !jumpy },
    { id: 'fish', label: 'Fishing', ok: advisory.go && !jumpy && advisory.tone !== 'poor' },
  ];
  if (rough) {
    hints.push({ id: 'stay', label: 'Stay on land', ok: true });
  }
  return hints;
}

export function greetingForNow(now = new Date()): string {
  const hour = nairobiHour(now);
  if (hour < 11) {
    return 'This morning on the coast';
  }
  if (hour < 16) {
    return 'This afternoon on the coast';
  }
  return 'This evening on the coast';
}

export function whaleSeasonNow(now = new Date()): boolean {
  const month = nairobiMonth(now);
  return month >= 7 && month <= 10;
}
