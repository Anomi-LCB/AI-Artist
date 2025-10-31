import React from 'react';

const galleryItems = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACgyXpSF8LDoEG2VlK0z9kunNo2ZV2XASS-GRGRi4mGkraLEyRtSywZS8RLlUUyvrFrqi__tukTKf0OhsrrUQfVJ2bWAud8a22FywN1IU0EoovA0ZQEFfd7Qg_f0DbxZQJ8hPYAchADcMxbenvD79PolPjEpIWDAA-j5ZOqeL1j69PR73TkcrFO11SVMAX26iF31Vv3zxFOc5b-hult8Jv8opXAUMyDh4G9q9r9RpT7O2CAtMBNtc5otHSAV5IwfksOIveMlhciTU',
    alt: 'Book cover with dark, romantic imagery of a castle.',
    title: 'Gothic Romance',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrjr9aSrMZlX7WWEa6rcsMSuv3tQZRcBifkRBB3b1-B9iX6NfsEm-nJNCBpvglE7kGhHCaCPWqF2vikbyo9BR0zQaqYryzn9jMdlJlGRlAskaIRKZeJN0schtERC1fCp-GUmC2cUZThTuy3JTQcSEAnHyukVid75FHpr4M0E2BxeZvSQehbV9LXSNqQVxCYoeB7NRtaxLpOZvpo_MpyAD74LMYHPaT9nZzYvEgIAgz2fd4NIIcFUVaxwvfMnu_eia5TcoWznG0Feo',
    alt: 'Book cover with a simple, elegant design and a single tree.',
    title: 'Minimalist Fable',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxufbpTZJqMwoiR1CUa1lA2WGzKfiddL7mUtBazRasRUuxz-fxt1fCSSkrrDF8xDs_F7sopm5thC7txkcrzrD8yYIIM2gRmQ8pn0VPpkYr2g_UzBfIHc6PXO56eQvtbvcE_X6mzecJ7kXMjoeGC_ZLAAaC2FgmAUNdVjsVV1yd4797WUL5sW6RsRmNlbBNkKLfjY6Lr4ATP3wLdjCl6k-j7HrhlvFH5MIyaxSdEPTTFVgUrKkz5XiJb2QbTd2LMpxNbW9W-d9YAGE',
    alt: 'Book cover featuring ornate, flowing lines and nature motifs.',
    title: 'Art Nouveau Legend',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgIRHXvx5gkPdPxKGxihscNnvxgnRSIAjn0mF6N3n_oAei8CW2nmnddWMtE46GabV5EpRhgwJmJRagmrJat82GtRbZRpdRw6clxWY696NZr-3eNuuYS3nIPmrqSMXH1eDXIPAFHdezBCv0HXMNgjPsUivliR-9NLPqsY3CRkSFAsp1bGgCUBqrF0uJ5WWtgY-yhf4qYxaWY6yNjPvAXWtirIcirQ2RqVVmejqlWsjMXCK-Aum5dsdYzJzIm11odclOwpVIToMVxQU',
    alt: 'Book cover showing a dark, enchanted forest scene.',
    title: 'The Midnight Forest',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC56_8qfsURrSeYmVOcehBJHwTSa6UOiFV8f_OdBozeRYXt7Q3FsOuUnqf6UJF9SxpludV8VAhZrutBVN8uc6pBBnhcNBDS8aeaY4wCU_UfEkZNmklehASCoJ_2fm1x7WiPWj13X1zpZ9Lhz77jEYWG9xlpBC2fKaFUGPTZy6kfaYSh5usZvhQhSout2Q5MtxZBlbLbllUZ811AJYrQRuKjsOcKkg3DoNRllafUV4lLthvw6eMhdEb3cuA62mxC_DpGN8zc7ASokBQ',
    alt: 'Book cover with playful, charming illustrations.',
    title: 'Classic Whimsy',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfZdM7dxdeU0eilEn1d03BDwA2UYqTCpuUQnlZ9is8raD22jpxAZt4HrxhqzES-NwGhqAL89Em7bfxu1nEKkTO_fAB9JBZXNVHO8qTJcpmmzuTDJAMctJKI7iqft33x3ZuPtG1JltvBOBQ5hG5ujnd67DWvfKTfFV31y0-TKCX5KrzquTcCqku3QHlyIGiGgbVtonqAGhjyLDp-2mFZgeRcopLN887kXH3vyJoCyZI_uNRjuBG3E7aR6spBOl3vs80OVYqEwp2uzE',
    alt: 'Book cover with stars, planets, and celestial themes.',
    title: 'Cosmic Fable',
  },
];

const Gallery: React.FC = () => {
  return (
    <>
      <section className="mt-16 mb-4">
        <h2 className="text-gray-900 dark:text-gray-100 text-3xl font-bold leading-tight tracking-tight px-4 pb-3 pt-5">A Gallery of Wonders</h2>
      </section>
      <section>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 p-4">
          {galleryItems.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl">
              <img
                alt={item.alt}
                className="h-full w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                src={item.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white text-lg font-bold leading-tight">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Gallery;