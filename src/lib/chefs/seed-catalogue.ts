/**
 * Seed catalogue for the chef directory.
 *
 * These 16 records were previously hardcoded inside
 * `src/app/find-chefs/page.tsx`. They now live here for two reasons:
 *
 *  1. `scripts/seed-chefs.ts` writes them into Firestore so the live
 *     directory starts populated instead of empty.
 *  2. The directory falls back to them when Firestore returns nothing, so a
 *     cold database or a transient outage never renders an empty marketplace.
 *
 * Once real onboarded chefs exist in Firestore these become invisible: the
 * fallback only engages on an empty result. Entries are DEMO DATA.
 */

/**
 * Shown for a chef who has no profile photo yet, so a newly approved chef
 * never renders a broken image in the directory.
 */
export const CHEF_PHOTO_FALLBACK = '/images/chefs/chef_marco_rossi.png'

export interface SeedChef {
  id: string
  name: string
  cuisine: string
  rate: number
  rating: number
  reviews: number
  location: string
  badge: string
  bio: string
  photo: string
}

export const SEED_CHEFS: SeedChef[] = [
    { id: 'marco-rossi', name: 'Chef Marco Rossi', cuisine: 'Italian', rate: 150, rating: 4.9, reviews: 128, location: 'London, UK', badge: 'Fine Dining', bio: '15 years fine dining experience across Italy and the UK.', photo: '/images/chefs/chef_marco_rossi.png' },
    { id: 'yuki-tanaka', name: 'Chef Yuki Tanaka', cuisine: 'Japanese', rate: 200, rating: 5.0, reviews: 67, location: 'Dubai, UAE', badge: 'Omakase Master', bio: 'Trained at 3-Michelin-star restaurants in Tokyo.', photo: '/images/chefs/chef_yuki_tanaka.png' },
    { id: 'pierre-dubois', name: 'Chef Pierre Dubois', cuisine: 'French', rate: 180, rating: 4.7, reviews: 212, location: 'Paris, France', badge: 'Haute Cuisine', bio: 'Former executive chef at Hôtel de Crillon, Paris.', photo: '/images/chefs/chef_pierre_dubois.png' },
    { id: 'marcus-vance', name: 'Chef Marcus Vance', cuisine: 'American', rate: 160, rating: 4.9, reviews: 142, location: 'New York, USA', badge: 'Farm-to-Table', bio: 'James Beard nominee specializing in modern American farm-to-table tasting menus and wood-fired gastronomy.', photo: '/images/chefs/chef_marcus_vance.png' },
    { id: 'elena-beauchamp', name: 'Chef Éléna Beauchamp', cuisine: 'French-Canadian', rate: 140, rating: 4.8, reviews: 98, location: 'Montreal, Canada', badge: 'Nordic-French', bio: 'Crafts refined Quebecois-French fusion menus featuring wild foraged herbs, artisanal cheeses, and Atlantic seafood.', photo: '/images/chefs/chef_elena_beauchamp.png' },
    { id: 'wei-zhang', name: 'Chef Wei Zhang', cuisine: 'Chinese', rate: 175, rating: 5.0, reviews: 184, location: 'Shanghai, China', badge: 'Dim Sum & Wok Master', bio: '20 years mastering imperial Cantonese banquet dining, handmade dim sum, and precision wok artistry.', photo: '/images/chefs/chef_wei_zhang.png' },
    { id: 'olena-kovalenko', name: 'Chef Olena Kovalenko', cuisine: 'Ukrainian', rate: 110, rating: 4.9, reviews: 115, location: 'Kyiv, Ukraine', badge: 'Heritage Cuisine', bio: 'Reimagining Eastern European heritage cooking with modern fermentation techniques, delicate borscht reductions, and smoked delicacies.', photo: '/images/chefs/chef_olena_kovalenko.png' },
    { id: 'henrik-lindqvist', name: 'Chef Henrik Lindqvist', cuisine: 'Nordic', rate: 190, rating: 4.9, reviews: 87, location: 'Oslo, Norway', badge: 'Michelin Nordic', bio: 'Former head chef at leading Scandinavian fine dining establishments; specialized in cold-smoked fjord salmon and reindeer tartare.', photo: '/images/chefs/chef_henrik_lindqvist.png' },
    { id: 'kenji-sato', name: 'Chef Kenji Sato', cuisine: 'Japanese', rate: 220, rating: 5.0, reviews: 153, location: 'Kyoto, Japan', badge: 'Kaiseki Master', bio: 'Trained in Gion Kyoto, specializing in traditional seasonal Kaiseki multicourse banquets and Wagyu A5 preparations.', photo: '/images/chefs/chef_kenji_sato.png' },
    { id: 'min-jun-park', name: 'Chef Min-Jun Park', cuisine: 'Korean', rate: 165, rating: 4.9, reviews: 126, location: 'Seoul, South Korea', badge: 'K-Fine Dining', bio: 'Pioneering modernist Korean fine dining with 10-year aged jang sauces, Hanwoo beef pairing, and royal court banquets.', photo: '/images/chefs/chef_min_jun_park.png' },
    { id: 'tariq-al-ghamdi', name: 'Chef Tariq Al-Ghamdi', cuisine: 'Middle Eastern', rate: 195, rating: 4.9, reviews: 109, location: 'Riyadh, Saudi Arabia', badge: 'Royal Banquet', bio: 'Specializes in royal banquet hospitality, slow-cooked Najdi lamb, saffron-cardamom infusions, and luxury private dining.', photo: '/images/chefs/chef_tariq_al_ghamdi.png' },
    { id: 'aisha-okafor', name: 'Chef Aisha Okafor', cuisine: 'West African', rate: 80, rating: 4.8, reviews: 94, location: 'Lagos, Nigeria', badge: 'Traditional', bio: 'Bringing authentic West African flavours to private events.', photo: '/images/chefs/chef_aisha_okafor.png' },
    { id: 'sofia-mendez', name: 'Chef Sofía Mendez', cuisine: 'Spanish', rate: 120, rating: 4.9, reviews: 89, location: 'Barcelona, Spain', badge: 'Tapas & Paella', bio: 'Expert in traditional Catalan cuisine and modernist tapas.', photo: '/images/chefs/chef_sofia_mendez.png' },
    { id: 'james-osei', name: 'Chef James Osei', cuisine: 'Pan-African', rate: 70, rating: 4.8, reviews: 156, location: 'Accra, Ghana', badge: 'Events Specialist', bio: 'Creates vibrant Pan-African feasts for weddings and parties.', photo: '/images/chefs/chef_james_osei.png' },
    { id: 'meera-patel', name: 'Chef Meera Patel', cuisine: 'Indian', rate: 95, rating: 4.9, reviews: 203, location: 'Birmingham, UK', badge: 'Ayurvedic Chef', bio: 'Specialising in Ayurvedic nutrition and South Asian cuisine.', photo: '/images/chefs/chef_meera_patel.png' },
    { id: 'carlos-garcia', name: 'Chef Carlos Garcia', cuisine: 'Mexican', rate: 85, rating: 4.7, reviews: 71, location: 'Mexico City', badge: 'Street Food Expert', bio: 'Elevating traditional Mexican street food to fine dining.', photo: '/images/chefs/chef_carlos_garcia.png' },
]

/** Cuisine filter options shown in the directory UI. */
export const CUISINES: string[] = [
    'All', 'Italian', 'Japanese', 'French', 'American', 'French-Canadian', 'Chinese',
    'Ukrainian', 'Nordic', 'Korean', 'Middle Eastern', 'West African', 'Spanish', 'Indian', 'Mexican', 'Pan-African'
]
