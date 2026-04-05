export const prerender = false;

import flags from '../../../../public/flags.json';

export function GET({ params }: { params: { country: string } }) {
  const countryCode = params.country?.toLowerCase();
  const country = flags.find(
    f => f.code === countryCode || 
    f.name.toLowerCase().replace(/ /g, '-') === countryCode ||
    f.name.toLowerCase().replace(/ /g, '') === countryCode
  );

  if (!country) {
    return new Response(JSON.stringify({ error: 'Country not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(country.colors), {
    headers: { 'Content-Type': 'application/json' }
  });
}
