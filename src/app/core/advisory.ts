import { tellSeaStory } from './plain-speak';
import { Advisory, LandingSite, MarineSnapshot, SiteBoardRow } from './models';

export function scoreConditions(snapshot: MarineSnapshot): Advisory {
  const reasons: string[] = [];
  const wave = snapshot.waveHeightM;
  const nextWave = snapshot.nextWaveMaxM;
  const wind = snapshot.windKmh;
  const sst = snapshot.sstC;
  const current = snapshot.currentMs;

  if (wave !== null && wave >= 1.8) {
    return stayIn(`Wave height is ${wave.toFixed(1)} m — too high for most small craft.`, 14);
  }
  if (wind !== null && wind >= 40) {
    return stayIn(`Wind is ${Math.round(wind)} km/h. Wait for it to ease.`, 18);
  }

  let score = 18;
  if (wave !== null) {
    if (wave < 0.8) {
      score += 26;
      reasons.push('Low swell. Favourable for ngalawa and small boats.');
    } else if (wave < 1.3) {
      score += 16;
      reasons.push('Moderate swell. Workable for experienced crews.');
    } else {
      score += 6;
      reasons.push('Choppy. Stay close to shore if you go.');
    }
  }

  if (nextWave !== null && wave !== null && nextWave > wave + 0.4) {
    reasons.push(`Swell is building (up to ${nextWave.toFixed(1)} m in the next hours).`);
    score -= 8;
  }

  if (wind !== null) {
    if (wind < 18) {
      score += 16;
      reasons.push('Light wind.');
    } else if (wind < 28) {
      score += 8;
      reasons.push('A breeze is up, but still workable.');
    } else {
      score += 2;
      reasons.push('Strong wind for open boats.');
    }
  }

  if (sst !== null) {
    if (sst >= 26 && sst <= 29.5) {
      score += 28;
      reasons.push(`Sea surface ${sst.toFixed(1)}°C — preferred band for many pelagic species.`);
    } else if (sst >= 24.5 && sst < 32) {
      score += 14;
      reasons.push(`Sea surface ${sst.toFixed(1)}°C — usable, not peak.`);
    } else {
      score += 4;
      reasons.push(`Sea surface ${sst.toFixed(1)}°C is outside the usual coastal pelagic range.`);
    }
  } else {
    reasons.push('No temperature reading at this point.');
  }

  if (current !== null) {
    if (current >= 0.15 && current <= 0.9) {
      score += 12;
      reasons.push('A measurable current — fronts can concentrate bait.');
    } else if (current > 0.9) {
      score += 4;
      reasons.push('Strong current. Harder to hold gear.');
    }
  }

  score = Math.max(8, Math.min(96, Math.round(score)));
  if (score >= 70) {
    return { score, label: 'Favourable', tone: 'good', go: true, reasons };
  }
  if (score >= 48) {
    return { score, label: 'Mixed', tone: 'mixed', go: true, reasons };
  }
  return { score, label: 'Poor', tone: 'poor', go: false, reasons };
}

export function toBoardRows(sites: LandingSite[], snapshots: MarineSnapshot[]): SiteBoardRow[] {
  return sites.map((site, index) => {
    const marine = snapshots[index] ?? null;
    const advisory = marine ? scoreConditions(marine) : null;
    return {
      site,
      marine,
      advisory,
      story: marine && advisory ? tellSeaStory(marine, advisory) : null,
    };
  });
}

function stayIn(reason: string, score: number): Advisory {
  return { score, label: 'Stay in', tone: 'danger', go: false, reasons: [reason] };
}
