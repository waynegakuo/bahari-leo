const TZ = 'Africa/Nairobi';

export function nairobiDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now);
}

export function nairobiHour(now = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: 'numeric',
    hour12: false,
  }).format(now);
  return Number.parseInt(hour, 10);
}

export function nairobiMonth(now = new Date()): number {
  const month = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    month: 'numeric',
  }).format(now);
  return Number.parseInt(month, 10);
}

export function nairobiNowIso(now = new Date()): string {
  return now.toISOString();
}
