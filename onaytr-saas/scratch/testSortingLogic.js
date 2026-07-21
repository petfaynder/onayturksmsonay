const countryCallingCodes = {
  usa: '+1',
  canada: '+1',
  russia: '+7',
  kazakhstan: '+7',
  england: '+44'
};

const pricingData = {
  countries: [
    { name: 'england', code: 'england' },
    { name: 'italy', code: 'italy' },
    { name: 'ireland', code: 'ireland' }
  ],
  detailedPricing: {
    england: { whatsapp: { totalCount: 1000, minPrice: 15 } },
    italy: { whatsapp: { totalCount: 500, minPrice: 20 } },
    ireland: { whatsapp: { totalCount: 200, minPrice: 25 } }
  }
};

const selectedApp = 'whatsapp';
const countrySearch = '';
const countrySort = 'stock';
const sortDirection = 'desc';

const availableCountriesForApp = selectedApp && pricingData?.detailedPricing 
  ? Object.keys(pricingData.detailedPricing).filter(country => pricingData.detailedPricing[country][selectedApp])
  : [];

console.log("availableCountriesForApp:", availableCountriesForApp);

const filteredCountries = pricingData?.countries?.filter((c) => {
  const callingCode = countryCallingCodes[c.code.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
  const matchesSearch = c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
                        callingCode.includes(countrySearch.toLowerCase()) ||
                        (countrySearch.replace('+', '').length > 0 && callingCode.includes(countrySearch.replace('+', '')));
  return availableCountriesForApp.includes(c.code) && matchesSearch;
}) || [];

console.log("filteredCountries:", filteredCountries);

const sortedCountries = [...filteredCountries].sort((a, b) => {
  const aDetails = pricingData?.detailedPricing[a.code][selectedApp];
  const bDetails = pricingData?.detailedPricing[b.code][selectedApp];
  
  if (!aDetails || !bDetails) return 0;

  if (countrySort === 'stock') {
    return sortDirection === 'desc' 
      ? bDetails.totalCount - aDetails.totalCount 
      : aDetails.totalCount - bDetails.totalCount;
  }
  return 0;
});

console.log("sortedCountries:", sortedCountries);
