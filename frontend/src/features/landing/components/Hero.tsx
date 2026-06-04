import React from 'react';
import SearchWidget from './SearchWidget.tsx';
import heroImage from '../../../assets/images/landing-page/1234.jpg';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Airplane sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1a3f]/45 via-[#8b4d48]/20 to-[#09143b]/55" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[720px] w-full max-w-[1240px] flex-col items-center justify-center px-5 pb-48 pt-16 sm:pb-52 sm:pt-20 md:min-h-[800px] md:px-8 md:pb-56 md:pt-24">
        <div className="text-white text-center">
        <h1 className="text-[26px] font-bold leading-[1.02] tracking-tight sm:text-[34px] md:text-[42px]">
          Your Journey, Expertly Curated.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/90 sm:mt-5 sm:text-[15px] md:mt-6 md:text-lg">
          Experience luxury travel with the precision of a digital concierge. Find your next escape today.
        </p>
      </div>

      <div id="flights" className="mt-6 w-full scroll-mt-24 sm:mt-8 md:mt-10">
      <div id="air-lines" className="mt-6 w-full scroll-mt-24 sm:mt-8 md:mt-10"></div>
        <SearchWidget />
      </div>
      </div>
    </section>
  );
};