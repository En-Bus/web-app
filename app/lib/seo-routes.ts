// Inter-city (SETC) route slugs — long-distance buses between cities.
// Only routes with actual data in the database.
export const SEO_ROUTE_SLUGS = [
  // Chennai hub — highest traffic
  'chennai-to-bangalore',
  'bangalore-to-chennai',
  'chennai-to-madurai',
  'madurai-to-chennai',
  'chennai-to-trichy',
  'trichy-to-chennai',
  'chennai-to-kumbakonam',
  'kumbakonam-to-chennai',
  'chennai-to-salem',
  'salem-to-chennai',
  'chennai-to-puducherry',
  'puducherry-to-chennai',
  'chennai-to-velankanni',
  'velankanni-to-chennai',
  'chennai-to-thanjavur',
  'thanjavur-to-chennai',
  'chennai-to-nagercoil',
  'nagercoil-to-chennai',
  'chennai-to-tirunelveli',
  'tirunelveli-to-chennai',
  'chennai-to-coimbatore',
  'coimbatore-to-chennai',
  'chennai-to-thoothukudi',
  'thoothukudi-to-chennai',
  'chennai-to-hosur',
  'hosur-to-chennai',
  'chennai-to-trivandrum',
  'trivandrum-to-chennai',
  'chennai-to-erode',
  'erode-to-chennai',
  // Bangalore hub
  'bangalore-to-trichy',
  'trichy-to-bangalore',
  'bangalore-to-salem',
  'bangalore-to-coimbatore',
  'coimbatore-to-bangalore',
  'bangalore-to-madurai',
  // Other inter-city
  'chennai-to-marthandam',
  'marthandam-to-chennai',
  'chennai-to-nagapattinam',
  'chennai-to-karaikudi',
  'chennai-to-kanyakumari',
  'kanyakumari-to-chennai',
  'chennai-to-tirupathi',
  'tirupathi-to-chennai',
  'chennai-to-rameshwaram',
  'trichy-to-nagercoil',
  'chennai-to-tiruppur',
  'tiruppur-to-chennai',
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

// Chennai city bus (MTC) route slugs — only pairs with 5+ unique route numbers
// serving them, ensuring content-rich pages with multiple bus options.
export const CITY_BUS_ROUTE_SLUGS = [
  'koyambedu-to-kilambakkam',
  'kilambakkam-to-koyambedu',
  'kilambakkam-to-thiruvanmiyur',
  'thiruvanmiyur-to-kilambakkam',
  'koyambedu-to-avadi',
  'avadi-to-koyambedu',
  'koyambedu-to-red-hills',
  'red-hills-to-koyambedu',
  'koyambedu-to-poonamallee',
  'poonamallee-to-koyambedu',
  'poonamallee-to-royapuram',
  'royapuram-to-poonamallee',
  'island-ground-to-manali',
  'manali-to-island-ground',
  'koyambedu-to-island-ground',
  'island-ground-to-koyambedu',
  'red-hills-to-vallalar-nagar',
  'koyambedu-to-thyagaraya-nagar',
  'thyagaraya-nagar-to-koyambedu',
  'kilambakkam-to-thyagaraya-nagar',
  'thyagaraya-nagar-to-kilambakkam',
  'avadi-to-poonamallee',
  'poonamallee-to-avadi',
  'poonamallee-to-sunguvarchathiram',
  'sunguvarchathiram-to-poonamallee',
  'vadapalani-to-koyambedu',
  'koyambedu-to-vadapalani',
  'tambaram-to-kilambakkam',
  'kilambakkam-to-tambaram',
  'royapuram-to-iyyappanthangal',
  'red-hills-to-avadi',
  'avadi-to-red-hills',
  'koyambedu-to-anna-nagar',
  'anna-nagar-to-koyambedu',
  'kilambakkam-to-avadi',
  'avadi-to-kilambakkam',
  'kilambakkam-to-chennai-airport',
  'chennai-airport-to-kilambakkam',
  'koyambedu-to-royapuram',
  'royapuram-to-koyambedu',
  'island-ground-to-thiruvanmiyur',
  'thiruvanmiyur-to-island-ground',
  'royapuram-to-tambaram',
  'tambaram-to-royapuram',
  'royapuram-to-kundrathur',
  'kundrathur-to-royapuram',
] as const;
