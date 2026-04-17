import fs from 'fs';
import path from 'path';

type Route = {
  origin_stop: string;
  dest_stop: string;
};

type Hub = {
  name: string;
  slug: string;
  order: number;
  normalized: string;
};

const HUB_NAMES = [
  'Chennai',
  'Madurai',
  'Coimbatore',
  'Trichy',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Bangalore',
  'Thanjavur',
  'Kumbakonam',
  'Nagercoil',
  'Dindigul',
  'Karaikudi',
  'Vellore',
  'Tiruppur',
  'Hosur',
  'Puducherry',
  'Thoothukudi',
  'Kanyakumari',
  'Villupuram',
  'Karur',
  'Namakkal',
  'Dharmapuri',
  'Krishnagiri',
  'Pollachi',
  'Palani',
  'Ooty',
  'Rameswaram',
  'Kodaikanal',
  'Tiruvannamalai',
  'Cuddalore',
  'Marthandam',
  'Tenkasi',
  'Rasipuram',
  'Attur',
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const HUBS: Hub[] = HUB_NAMES.map((name, index) => ({
  name,
  slug: slugify(name),
  order: index,
  normalized: normalize(name),
}));

function matchHub(stopName: string): Hub | null {
  const normalizedStop = normalize(stopName);
  for (const hub of HUBS) {
    if (
      normalizedStop === hub.normalized ||
      normalizedStop.startsWith(hub.normalized) ||
      normalizedStop.includes(` ${hub.normalized} `)
    ) {
      return hub;
    }
  }
  return null;
}

function main() {
  const routesPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '..',
    '..',
    'backend',
    'data',
    'processed',
    'routes.json',
  );
  const raw = fs.readFileSync(routesPath, 'utf8');
  const routes: Route[] = JSON.parse(raw);

  const slugSet = new Set<string>();

  for (const route of routes) {
    const fromHub = matchHub(route.origin_stop);
    const toHub = matchHub(route.dest_stop);
    if (!fromHub || !toHub) continue;
    if (fromHub.slug === toHub.slug) continue;
    slugSet.add(`${fromHub.slug}-to-${toHub.slug}`);
  }

  const slugs = [...slugSet].sort((a, b) => {
    const [aFrom, aTo] = a.split('-to-');
    const [bFrom, bTo] = b.split('-to-');
    const fromOrderDiff = (HUBS.find((h) => h.slug === aFrom)?.order ?? 99) -
      (HUBS.find((h) => h.slug === bFrom)?.order ?? 99);
    if (fromOrderDiff !== 0) return fromOrderDiff;
    const toOrderDiff = (HUBS.find((h) => h.slug === aTo)?.order ?? 99) -
      (HUBS.find((h) => h.slug === bTo)?.order ?? 99);
    if (toOrderDiff !== 0) return toOrderDiff;
    return a.localeCompare(b);
  });

  const capped = slugs.slice(0, 400);

  console.error(`Total hub-to-hub routes: ${slugs.length}`);
  console.error(`Capped to: ${capped.length}`);

  process.stdout.write(JSON.stringify(capped, null, 2));
}

main();
