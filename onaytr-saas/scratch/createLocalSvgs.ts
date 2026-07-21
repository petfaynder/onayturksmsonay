import * as fs from 'fs';
import * as path from 'path';

const svgDir = path.join(process.cwd(), 'public', 'services');

const svgs: Record<string, string> = {
  getir: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#5d3ebd"/>
    <text x="50" y="58" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="28" fill="#ffd200" text-anchor="middle">getir</text>
  </svg>`,
  yemeksepeti: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#ea004b"/>
    <path d="M50 25 C35 25 25 35 25 48 H75 C75 35 65 25 50 25 Z" fill="#ffffff"/>
    <rect x="20" y="51" width="60" height="6" rx="3" fill="#ffffff"/>
    <circle cx="50" cy="20" r="4" fill="#ffffff"/>
    <text x="50" y="78" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">yemeksepeti</text>
  </svg>`,
  trendyol: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#f27a1a"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="-1">ty</text>
  </svg>`,
  sahibinden: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#ffe800"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="28" fill="#1b2430" text-anchor="middle">sh</text>
    <text x="50" y="78" font-family="'Inter', sans-serif" font-weight="800" font-size="10" fill="#1b2430" text-anchor="middle" letter-spacing="0.5">sahibinden</text>
  </svg>`,
  letgo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#ff5a5f"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">letgo</text>
  </svg>`,
  papara: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#0b0b0c"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">papara</text>
  </svg>`,
  tosla: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#ff007f"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">tosla</text>
  </svg>`,
  hepsiburadacom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#ff6000"/>
    <text x="50" y="65" font-family="'Inter', sans-serif" font-weight="900" font-size="48" fill="#ffffff" text-anchor="middle">h</text>
  </svg>`,
  bigolive: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#00e3e3"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">BIGO</text>
  </svg>`,
  '1xbet': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#0c4587"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle">1xBet</text>
  </svg>`,
  '1win': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#121826"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="28" fill="#32b5e8" text-anchor="middle">1win</text>
  </svg>`,
  azar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#00d4d4"/>
    <text x="50" y="58" font-family="'Inter', sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">azar</text>
  </svg>`
};

function main() {
  if (!fs.existsSync(svgDir)) {
    fs.mkdirSync(svgDir, { recursive: true });
  }

  for (const [name, content] of Object.entries(svgs)) {
    const filePath = path.join(svgDir, `${name}.svg`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Saved: ${filePath}`);
  }
}

main();
