import React from 'react';
import { Link } from 'react-router-dom';

interface Feature {
  title: string;
  description: string;
}

export const ValueProposition: React.FC = () => {
  const features: Feature[] = [
    {
      title: 'Exclusive Member Discounts',
      description: ''
    },
    {
      title: 'Personalized Travel Plans',
      description: ''
    },
    {
      title: 'Premium Hotel Search',
      description: ''
    }
  ];

  return (
    <section className="bg-[#f2f3f5] py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-8 rounded-[22px] bg-[#f0eadf] px-6 py-8 sm:px-8 sm:py-10 md:grid-cols-[1fr_290px] md:gap-6 md:px-10">
          <div className="max-w-[610px]">
            <h2 className="text-[30px] font-bold leading-[1.02] tracking-tight text-[#1d3d8f] sm:text-[34px] md:text-[40px]">
              Your Journey,
              <br />
              Perfected Through
              <br />
              Access
            </h2>
            <p className="mt-5 max-w-[570px] text-[14px] leading-relaxed text-[#525762] sm:text-[15px] md:mt-7 md:text-[16px]">
              A Carlton Leisure account offers more than just convenience. It is your gateway to the world's most exclusive destinations and a level of service that anticipates your every need.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex min-w-[120px] justify-center rounded-[10px] bg-[#1c3f95] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_14px_30px_rgba(28,63,149,0.25)] transition-colors hover:bg-[#15357f] sm:mt-10 sm:px-8 sm:text-[16px]"
            >
              Login
            </Link>
          </div>

          <div className="space-y-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#e9decc] bg-[#f7eddc] px-5 py-4 sm:px-6 sm:py-5"
              >
                <h3 className="text-[18px] font-semibold leading-tight text-[#1d3d8f] sm:text-[20px]">{feature.title}</h3>
                {feature.description && (
                  <p className="text-sm text-gray-600">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
