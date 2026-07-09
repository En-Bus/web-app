// Inter-city (SETC/TNSTC) route slugs — long-distance buses between cities.
// Only routes verified to return ≥3 results from the search API.
export const SEO_ROUTE_SLUGS = [
  'arakkonam-to-kanchipuram',
  'arakkonam-to-tirupathi',
  'arapalayam-to-coimbatore',
  'arapalayam-to-erode',
  'arapalayam-to-salem',
  'bangalore-to-chennai',
  'bangalore-to-coimbatore',
  'bangalore-to-madurai',
  'bangalore-to-salem',
  'batlagundu-to-tiruppur',
  'chennai-to-ariyalur',
  'chennai-to-attur',
  'chennai-to-bengaluru',
  'chennai-to-coimbatore',
  'chennai-to-dharmapuri',
  'chennai-to-dindigul',
  'chennai-to-erode',
  'chennai-to-hosur',
  'chennai-to-karaikudi',
  'chennai-to-kumbakonam',
  'chennai-to-madurai',
  'chennai-to-namakkal',
  'chennai-to-salem',
  'chennai-to-thanjavur',
  'chennai-to-thoothukudi',
  'chennai-to-tirunelveli',
  'chennai-to-tiruppur',
  'chennai-to-tiruvarur',
  'chennai-to-vellore',
  'chennai-to-villupuram',
  'chidambaram-to-chennai',
  'coimbatore-to-bangalore',
  'coimbatore-to-chennai',
  'coimbatore-to-kumbakonam',
  'coimbatore-to-madurai',
  'coimbatore-to-palani',
  'coimbatore-to-pollachi',
  'cumbum-to-coimbatore',
  'dindigul-to-chennai',
  'dindigul-to-coimbatore',
  'dindigul-to-madurai',
  'erode-to-anthiyur',
  'erode-to-chennai',
  'erode-to-dindigul',
  'erode-to-karur',
  'erode-to-madurai',
  'erode-to-tiruppur',
  'gandhipuram-to-tirupathi',
  'kallakurichi-to-bengaluru',
  'kalpakkam-to-chengalpattu',
  'kanchipuram-to-bangalore',
  'kanchipuram-to-vellore',
  'kumbakonam-to-chennai',
  'kumbakonam-to-chennai-madhavaram',
  'kumbakonam-to-coimbatore',
  'kumbakonam-to-karur',
  'kumbakonam-to-thanjavur',
  'kumbakonam-to-tiruppur',
  'madurai-arappalayam-to-erode',
  'madurai-to-chennai',
  'madurai-to-dindigul',
  'madurai-to-erode',
  'mannargudi-to-kumbakonam',
  'mannargudi-to-pattukkottai',
  'mannargudi-to-tiruthuraipoondi',
  'mayiladuthurai-to-chennai',
  'mayiladuthurai-to-kumbakonam',
  'nagapattinam-to-chennai',
  'nagapattinam-to-madurai',
  'nagercoil-to-madurai',
  'nagercoil-to-ooty',
  'nagercoil-to-puducherry',
  'nagercoil-to-thanjavur',
  'nagercoil-to-tirunelveli',
  'nagercoil-to-tiruppur',
  'namakkal-to-chennai',
  'namakkal-to-thuraiyur',
  'neyveli-to-chennai',
  'palladam-to-madurai',
  'pudukkottai-to-coimbatore',
  'rajapalayam-to-kumily',
  'rajapalayam-to-sankarankovil',
  'rajapalayam-to-tiruppur',
  'salem-to-attur',
  'salem-to-bomdidi',
  'salem-to-chennai',
  'salem-to-dharmapuri',
  'salem-to-dindigul',
  'salem-to-hosur',
  'salem-to-karur',
  'salem-to-krishnagiri',
  'salem-to-madurai',
  'salem-to-namakkal',
  'salem-to-rasipuram',
  'salem-to-thanjavur',
  'salem-to-tiruvannamalai',
  'salem-to-vellore',
  'salem-to-villupuram',
  'singanallur-to-madurai',
  'tambaram-to-kanchipuram',
  'tambaram-to-vellore',
  'thanjavur-to-ariyalur',
  'thanjavur-to-chennai',
  'thanjavur-to-kumbakonam',
  'thoothukudi-to-chennai',
  'thoothukudi-to-coimbatore',
  'thoothukudi-to-madurai',
  'thuraiyur-to-chennai',
  'tiruchengode-to-salem',
  'tirunelveli-to-chennai',
  'tirunelveli-to-coimbatore',
  'tirunelveli-to-hosur',
  'tirunelveli-to-madurai',
  'tiruppur-to-chennai',
  'tiruppur-to-coimbatore',
  'tiruppur-to-madurai',
  'tiruppur-to-salem',
  'tiruvannamalai-to-chennai-madhavaram',
  'tiruvarur-to-chennai',
  'tiruvarur-to-kumbakonam',
  'vellore-to-krishnagiri',
  'vellore-to-salem',
  'vellore-to-tiruvannamalai',
] as const;

// Unique origin cities extracted from inter-city + city bus slugs.
// Used by /buses-from/[city] hub pages and sitemap.
export function getHubCities(): string[] {
  const cities = new Set<string>();
  for (const slug of SEO_ROUTE_SLUGS) {
    const from = slug.split('-to-')[0];
    if (from) cities.add(from);
  }
  for (const slug of CITY_BUS_ROUTE_SLUGS) {
    const from = slug.split('-to-')[0];
    if (from) cities.add(from);
  }
  return [...cities].sort();
}

// Get all destination slugs reachable from a given origin city.
export function getRoutesFromCity(citySlug: string): {
  interCity: { toSlug: string; routeSlug: string }[];
  cityBus: { toSlug: string; routeSlug: string }[];
} {
  const interCity = SEO_ROUTE_SLUGS
    .filter((slug) => slug.startsWith(`${citySlug}-to-`))
    .map((slug) => ({ toSlug: slug.split('-to-')[1] ?? '', routeSlug: slug }))
    .filter((r) => r.toSlug.length > 0);
  const cityBus = CITY_BUS_ROUTE_SLUGS
    .filter((slug) => slug.startsWith(`${citySlug}-to-`))
    .map((slug) => ({ toSlug: slug.split('-to-')[1] ?? '', routeSlug: slug }))
    .filter((r) => r.toSlug.length > 0);
  return { interCity, cityBus };
}

// Chennai city bus (MTC) route slugs
export const CITY_BUS_ROUTE_SLUGS = [
  // Only routes verified to return ≥3 results
  'poonamallee-to-avadi',
  'poonamallee-to-royapuram',
  'royapuram-to-iyyappanthangal',
  'royapuram-to-poonamallee',
  'royapuram-to-tambaram',
] as const;

// Via-stop slugs — intermediate towns that buses pass through.
// Powers /via/[stop] pages — blue ocean SEO, no competitor has these.
// Only include stops verified to have intermediate stop_times data in the DB.
export const VIA_STOP_SLUGS = [
  'avinashi',
  'coimbatore',
  'dharapuram',
  'edappadi',
  'kalaiyar-kovil',
  'kovilpatti',
  'madurai',
  'melur',
  'ooty',
  'palani',
  'panruti',
  'ramanathapuram',
  'sankagiri',
  'sathyamangalam',
  'sholavandan',
  'tirumangalam',
  'vaniyambadi',
] as const;
