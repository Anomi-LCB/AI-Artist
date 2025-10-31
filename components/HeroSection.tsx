import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="my-10 @container">
      <div className="@[480px]:p-4">
        <div
          className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-8 text-center"
          data-alt="Abstract image of a mystical forest at night with glowing particles."
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYZWKCS_pE0zMHuen3uYTptuDfCoeXAcZUmuY_EfztY5XPkpZ_76h0z6sddtitWzv0_SKfqrfZaJMCamwAvZCHH9nqiJoTg7kY-thO9v2Ix0dvLy1sXe6k0JDhcUxqqgKZaXQKpGMvebx8QzgKzv3XbJ1t3sxF1s_QOzXVxXc0b9GdDPI38l9mGwlnGOLm7L17DYGs-L45MGaDF0a-S1mhW3oDBWkuxCzXSwY3DLQd0oQ7AyHMZjJ4i_gf_2mL0J2Jt4K98eKcQFA")',
          }}
        >
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-white text-4xl font-black leading-tight tracking-tight @[480px]:text-6xl">
              Where Every Cover Tells a Story
            </h1>
            <h2 className="text-white/90 text-base font-normal leading-normal @[480px]:text-lg">
              Discover enchanting designs that bring fairy tales to life.
            </h2>
          </div>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 @[480px]:h-14 @[480px]:px-8 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
            <span className="truncate">Explore the Collection</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;