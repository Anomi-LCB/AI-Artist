import React from 'react';

const artists = [
  {
    name: 'Elara Vance',
    specialty: 'Specializes in weaving dark romance and gothic elements into captivating visual narratives.',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL4_9XHyLwzxKNtVT2nCEqPTBBbpSbsyamWaSn8zmbEt58rxAB-3160X9Dl_sGOr_OiaWPqY_GMO_L5tbd1B_XCp7V4lBEX40QE2ktcHzsXVYGLsGbQ8x9RDsRlW7TDbjlRF7GxeTgbweXE4P1QKQBPtlqOE9kyUKa4lsydtIyGTBxxW4o8jC_2HjRaZ_3l9IABde7KjppzXVtOAK7IiczmgURera14X_SzTdt5F6Cqe1Yqm2TA4MXzr3NYBymxNMc2K_SHdpK9XE',
    alt: 'Portrait of artist Elara Vance',
  },
  {
    name: 'Orion Kade',
    specialty: 'A master of minimalist design, bringing fables to life with clean lines and striking simplicity.',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMMG6kpkeH1snFdXT5jVgXBypd30ZByiezXy-iNIkQXf09GVAaCRI9p5LSsiO5aBakml7FueBhIYRJ7_VZPScXNFZ8PrAR6_UfxK7cC7iVnq8fKmURkSsHacpZS_QKykBiXV_Rsva-pAW9XClqmvsrMI767fuvALgncu0iPQi2a0hUEPDqae4B9IESMKwVFNr-UuRhH3bpwkWOa5YutYV2LFjx-mDlgTF-JtKLhj_-icDWOp25LuFKDK1RofqO-gWaTvm_FRcX4WE',
    alt: 'Portrait of artist Orion Kade',
  },
  {
    name: 'Lyra Meadowlight',
    specialty: 'Creates whimsical worlds filled with charming characters and a touch of classic storybook magic.',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFR_m-VFlmQilYibEK3kDhCbDebh2LEDeJsooKOMlGj_aNUI6Va9j66rSrSqmsiSS86tBfxJCAVwZneIMXzeDdZX7I6-pxp_8X_6rXLl_1rJc0jYr2-0Bx0QLb8ev5yNiz_5SEe22PmoZeE3QJWG_b79nq8ThkmtrRdp7CFodnBcKEak7iZxDnr4cEd0kAfEKIBXJWlNdzC_x_2rx3o7eZybDFQRRBil72AG6KHLp39izgmTbAXqK9lLQshHRiCdg9PzXzsrumE3M',
    alt: 'Portrait of artist Lyra Meadowlight',
  },
];

const ArtistSection: React.FC = () => {
  return (
    <>
      <section className="mt-16 mb-4">
        <h2 className="text-gray-900 dark:text-gray-100 text-3xl font-bold leading-tight tracking-tight px-4 pb-3 pt-5">Meet the Dreamers</h2>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {artists.map((artist, index) => (
          <div key={index} className="flex flex-col items-center text-center p-6 bg-white dark:bg-background-dark/50 rounded-lg">
            <img
              className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-primary/20"
              data-alt={artist.alt}
              src={artist.imgSrc}
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{artist.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{artist.specialty}</p>
          </div>
        ))}
      </section>
    </>
  );
};

export default ArtistSection;