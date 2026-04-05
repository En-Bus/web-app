// Inter-city (SETC/TNSTC) route slugs — long-distance buses between cities.
// Only routes verified to return results from the search API.
export const SEO_ROUTE_SLUGS = [
  // Chennai hub — highest search volume
  'chennai-to-madurai',
  'madurai-to-chennai',
  'chennai-to-coimbatore',
  'coimbatore-to-chennai',
  'chennai-to-trichy',
  'trichy-to-chennai',
  'chennai-to-bangalore',
  'bangalore-to-chennai',
  'chennai-to-salem',
  'salem-to-chennai',
  'chennai-to-puducherry',
  'puducherry-to-chennai',
  'chennai-to-vellore',
  'chennai-to-tirunelveli',
  'chennai-to-nagercoil',
  'chennai-to-kumbakonam',
  'chennai-to-thanjavur',
  'thanjavur-to-chennai',
  'chennai-to-erode',
  'erode-to-chennai',
  'chennai-to-hosur',
  'chennai-to-thoothukudi',
  'chennai-to-velankanni',
  'velankanni-to-chennai',
  'chennai-to-trivandrum',
  'chennai-to-rameshwaram',
  'chennai-to-kanyakumari',
  'kanyakumari-to-chennai',
  'chennai-to-tiruppur',
  'chennai-to-nagapattinam',
  'chennai-to-karaikudi',
  'chennai-to-marthandam',
  'chennai-to-tirupathi',
  // Bangalore hub
  'bangalore-to-trichy',
  'trichy-to-bangalore',
  'bangalore-to-salem',
  'bangalore-to-coimbatore',
  'coimbatore-to-bangalore',
  'bangalore-to-madurai',
  // Coimbatore hub
  'coimbatore-to-erode',
  'erode-to-coimbatore',
  'coimbatore-to-ooty',
  'coimbatore-to-trichy',
  'trichy-to-coimbatore',
  'coimbatore-to-tirupur',
  'tirupur-to-coimbatore',
  'coimbatore-to-palani',
  'palani-to-coimbatore',
  'coimbatore-to-salem',
  'salem-to-coimbatore',
  'coimbatore-to-pollachi',
  // Madurai hub
  'madurai-to-trichy',
  'trichy-to-madurai',
  'madurai-to-kodaikanal',
  'kodaikanal-to-madurai',
  'madurai-to-dindigul',
  'dindigul-to-madurai',
  'madurai-to-rameswaram',
  'rameswaram-to-madurai',
  'madurai-to-palani',
  'palani-to-madurai',
  'madurai-to-salem',
  'salem-to-madurai',
  'madurai-to-karaikudi',
  'karaikudi-to-madurai',
  'madurai-to-tirunelveli',
  'tirunelveli-to-madurai',
  // Trichy hub
  'trichy-to-thanjavur',
  'thanjavur-to-trichy',
  'trichy-to-karaikudi',
  'karaikudi-to-trichy',
  'trichy-to-erode',
  'erode-to-trichy',
  'trichy-to-salem',
  'salem-to-trichy',
  'trichy-to-karur',
  'karur-to-trichy',
  'trichy-to-vellore',
  'vellore-to-trichy',
  'trichy-to-palani',
  'trichy-to-nagercoil',
  // Salem hub
  'salem-to-erode',
  'erode-to-salem',
  'salem-to-yercaud',
  // Erode hub
  'erode-to-ooty',
  'erode-to-madurai',
  'erode-to-palani',
  // Tirunelveli hub
  'tirunelveli-to-tenkasi',
  'tenkasi-to-tirunelveli',
  'tirunelveli-to-nagercoil',
  'nagercoil-to-tirunelveli',
  'tirunelveli-to-coimbatore',
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
    .map((slug) => ({ toSlug: slug.split('-to-')[1], routeSlug: slug }));
  const cityBus = CITY_BUS_ROUTE_SLUGS
    .filter((slug) => slug.startsWith(`${citySlug}-to-`))
    .map((slug) => ({ toSlug: slug.split('-to-')[1], routeSlug: slug }));
  return { interCity, cityBus };
}

// Chennai city bus (MTC) route slugs
export const CITY_BUS_ROUTE_SLUGS = [
  // Chennai MTC
  'koyambedu-to-kilambakkam',
  'kilambakkam-to-koyambedu',
  'kilambakkam-to-thiruvanmiyur',
  'thiruvanmiyur-to-kilambakkam',
  'koyambedu-to-avadi',
  'avadi-to-koyambedu',
  'koyambedu-to-poonamallee',
  'poonamallee-to-koyambedu',
  'poonamallee-to-royapuram',
  'royapuram-to-poonamallee',
  'avadi-to-poonamallee',
  'poonamallee-to-avadi',
  'poonamallee-to-sunguvarchathiram',
  'sunguvarchathiram-to-poonamallee',
  'vadapalani-to-koyambedu',
  'koyambedu-to-vadapalani',
  'tambaram-to-kilambakkam',
  'kilambakkam-to-tambaram',
  'royapuram-to-iyyappanthangal',
  'kilambakkam-to-avadi',
  'avadi-to-kilambakkam',
  'koyambedu-to-royapuram',
  'royapuram-to-koyambedu',
  'royapuram-to-tambaram',
  'tambaram-to-royapuram',
  'royapuram-to-kundrathur',
  'kundrathur-to-royapuram',
  'koyambedu-to-tambaram',
  'tambaram-to-koyambedu',
  // Coimbatore city bus
  'gandhipuram-to-singanallur',
  'singanallur-to-gandhipuram',
  'gandhipuram-to-ukkadam',
  'ukkadam-to-gandhipuram',
] as const;
