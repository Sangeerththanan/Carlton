import React from 'react';

interface Package {
  id: number;
  title: string;
  image: string;
  category: string;
  price?: string;
  description: string;
}

export const HolidayPackages: React.FC = () => {
  const packages: Package[] = [
    {
      id: 1,
      title: 'Classic Italy Heritage',
      image: new URL('../../../assets/images/landing-page/italy.png', import.meta.url).href,
      category: 'CULTURAL ESCAPE',
      price: '£1,249',
      description: 'Experience the beauty of Rome, Florence, and Venice'
    },
    {
      id: 2,
      title: 'Dubai Luxury Sands',
      image: new URL('../../../assets/images/landing-page/dubai.png', import.meta.url).href,
      category: 'LUXURY ESCAPE',
      price: '£899',
      description: 'Luxury shopping, desert adventures, and modern architecture'
    },
    {
      id: 3,
      title: 'Bangkok City Rhythm',
      image: new URL('../../../assets/images/landing-page/bankok.png', import.meta.url).href,
      category: 'CULTURAL ESCAPE',
      price: '£745',
      description: 'Vibrant street life, temples, and delicious cuisine'
    },
    {
      id: 4,
      title: 'Classic Italy Heritage',
      image: new URL('../../../assets/images/landing-page/italy.png', import.meta.url).href,
      category: 'CULTURAL ESCAPE',
      price: '£1,249',
      description: 'Sacred sites and spiritual journeys across Asia'
    }
  ];

  const cardSpans = [
    'md:col-span-6',
    'md:col-span-6',
    'md:col-span-5',
    'md:col-span-7',
  ];

  return (
    <section className="bg-[#f2f3f5] pb-10 pt-24 sm:pt-32 md:pb-14 md:pt-40">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:mb-10">
          <div>
            <h2 className="text-[28px] font-bold tracking-tight text-[#1d3d8f] sm:text-[32px] md:text-4xl">
              Our Curated Holiday Packages
            </h2>
          </div>
          <a href="#" className="pt-1 text-[15px] font-semibold text-[#af7514] transition-colors hover:text-[#8f5f10] sm:pt-2 sm:text-lg">
            Explore All →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`group relative h-[240px] overflow-hidden rounded-[24px] shadow-[0_18px_30px_rgba(16,26,54,0.15)] transition-transform hover:-translate-y-1 sm:h-[270px] md:h-[290px] ${cardSpans[index]}`}
            >
              <img
                src={pkg.image}
                alt={pkg.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

              <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6 md:p-7">
                <div>
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[9px] font-semibold tracking-[0.16em] text-white backdrop-blur-sm">
                    {pkg.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-[24px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[26px] md:text-[32px]">{pkg.title}</h3>
                  {pkg.price && (
                    <div className="mt-2 text-xs text-white/85 sm:text-sm">
                      Starting from <span className="pl-1 text-[18px] font-bold leading-none text-[#f8b22f] sm:text-[22px] md:text-[26px]">{pkg.price}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
