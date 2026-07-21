import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Ensure 5sim provider exists
    let provider = await prisma.apiProvider.findFirst({
      where: { name: '5sim' }
    });

    if (!provider) {
      // Create if it doesn't exist (assuming environment variable or default)
      provider = await prisma.apiProvider.create({
        data: {
          name: '5sim',
          apiKey: process.env.FIVESIM_API_KEY || 'YOUR_API_KEY_HERE',
          isActive: true
        }
      });
    }

    // 2. Connect to 5sim and get pricing list
    const fiveSim = new FiveSimProvider(provider.apiKey);
    const rawPrices = await fiveSim.getPrices(); 
    
    // rawPrices format: { "russia": { "whatsapp": { "any": { cost: 10, count: 100 } } } }

    const countriesSet = new Set<string>();
    const servicesSet = new Set<string>();

    for (const [country, products] of Object.entries(rawPrices as Record<string, any>)) {
      countriesSet.add(country);
      for (const [product] of Object.entries(products as Record<string, any>)) {
        servicesSet.add(product);
      }
    }

    // 3. Upsert Countries
    let countriesAdded = 0;
    for (const countryCode of Array.from(countriesSet)) {
      await prisma.country.upsert({
        where: { providerCode: countryCode },
        update: {},
        create: {
          providerCode: countryCode,
          name: countryCode, // In a real app we'd map this to a localized name
          flagCode: countryCode,
          isActive: false // Default to false so admin has to explicitly enable
        }
      });
      countriesAdded++;
    }

    // 4. Upsert Services
    let servicesAdded = 0;
    for (const serviceCode of Array.from(servicesSet)) {
      await prisma.service.upsert({
        where: { providerCode: serviceCode },
        update: {},
        create: {
          providerCode: serviceCode,
          name: serviceCode, // Could format to title case
          isActive: false // Default to false
        }
      });
      servicesAdded++;
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete. ${countriesAdded} countries, ${servicesAdded} services processed.`
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Sync failed: ' + error.message }, { status: 500 });
  }
}
