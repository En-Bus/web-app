import type { NextConfig } from 'next';

// Colloquial / short-form city name aliases → canonical slug.
// Keeps URLs shared by users working instead of 404ing.
// Must stay in sync with COLLOQUIAL_NAMES in app/lib/bus-search.ts.
const CITY_ALIASES: [string, string][] = [
  ['trichy', 'tiruchirappalli'],
  ['tiruchi', 'tiruchirappalli'],
  ['covai', 'coimbatore'],
  ['pondy', 'puducherry'],
  ['pondicherry', 'puducherry'],
  ['nellai', 'tirunelveli'],
  ['tuticorin', 'thoothukudi'],
  ['madras', 'chennai'],
  ['tanjore', 'thanjavur'],
];

const nextConfig: NextConfig = {
  async redirects() {
    const rules: {
      source: string;
      destination: string;
      permanent: boolean;
    }[] = [];

    for (const [alias, canonical] of CITY_ALIASES) {
      // /buses-from/trichy → /buses-from/tiruchirappalli
      rules.push({
        source: `/buses-from/${alias}`,
        destination: `/buses-from/${canonical}`,
        permanent: true,
      });

      // /bus/trichy-to-madurai → /bus/tiruchirappalli-to-madurai
      rules.push({
        source: `/bus/${alias}-to-:dest`,
        destination: `/bus/${canonical}-to-:dest`,
        permanent: true,
      });

      // /bus/chennai-to-trichy → /bus/chennai-to-tiruchirappalli
      rules.push({
        source: `/bus/:orig-to-${alias}`,
        destination: `/bus/:orig-to-${canonical}`,
        permanent: true,
      });
    }

    return rules;
  },
};

export default nextConfig;
