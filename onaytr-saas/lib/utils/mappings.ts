export const SYSTEM_TO_HEROSMS_COUNTRY: Record<string, number> = {
  russia: 0,
  ukraine: 1,
  kazakhstan: 2,
  china: 3,
  philippines: 4,
  myanmar: 5,
  indonesia: 6,
  malaysia: 7,
  kenya: 8,
  vietnam: 10,
  kyrgyzstan: 11,
  usa: 187,
  england: 16,
  unitedkingdom: 16,
  poland: 15,
  germany: 43,
  france: 78,
  spain: 56,
  italy: 86,
  netherlands: 48,
  argentina: 39,
  brazil: 73,
  colombia: 33,
  mexico: 54,
  india: 22,
  turkey: 62,
  turkiye: 62,
  azerbaijan: 35,
  romania: 32,
  egypt: 21,
  thailand: 52,
  singapore: 196,
  hongkong: 14,
  japan: 182,
  southafrica: 31,
  nigeria: 19,
  saudiarabia: 53,
  israel: 13,
  pakistan: 66,
  uzbekistan: 40,
  georgia: 128,
  lithuania: 44
};

export const HEROSMS_TO_SYSTEM_COUNTRY: Record<number, string> = Object.entries(SYSTEM_TO_HEROSMS_COUNTRY).reduce(
  (acc, [key, val]) => {
    acc[val] = key;
    return acc;
  },
  {} as Record<number, string>
);

export const SYSTEM_TO_HEROSMS_SERVICE: Record<string, string> = {
  whatsapp: 'wa',
  telegram: 'tg',
  google: 'go',
  instagram: 'ig',
  facebook: 'fb',
  tiktok: 'lf',
  twitter: 'tw',
  netflix: 'nf',
  spotify: 'spp',
  discord: 'ds',
  steam: 'mt',
  tinder: 'oi',
  badoo: 'fd',
  uber: 'ub',
  airbnb: 'ra',
  viber: 'vi',
  wechat: 'wb',
  imo: 'im',
  snapchat: 'fu',
  line: 'me',
  kakao: 'kt',
  linkedin: 'tn'
};

export const HEROSMS_TO_SYSTEM_SERVICE: Record<string, string> = Object.entries(SYSTEM_TO_HEROSMS_SERVICE).reduce(
  (acc, [key, val]) => {
    acc[val] = key;
    return acc;
  },
  {} as Record<string, string>
);
