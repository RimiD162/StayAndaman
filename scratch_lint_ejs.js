import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsDir = path.join(__dirname, 'views');

const mockUser = {
  fullName: 'Rimi Dutta',
  email: 'rimi@example.com',
  avatar: '',
  phone: '9876543210'
};

const mockListing = {
  _id: 'listing_1',
  name: 'Ocean Breeze Villa',
  category: 'Hotel',
  location: 'Havelock Island',
  price: 4500,
  rating: 4,
  amenities: ['Wifi', 'AC', 'Pool'],
  image: '',
  image2: '',
  image3: '',
  image4: '',
  available: true
};

const mockBooking = {
  bookingId: 'BK12345',
  listingId: 'listing_1',
  listingName: 'Ocean Breeze Villa',
  category: 'Hotel',
  location: 'Havelock Island',
  listingImage: '',
  guestName: 'Rimi Dutta',
  guestEmail: 'rimi@example.com',
  guestPhone: '9876543210',
  checkIn: new Date(),
  checkOut: new Date(),
  nights: 2,
  guests: 2,
  roomType: 'Deluxe',
  pricePerNight: 4500,
  subtotal: 9000,
  tax: 0,
  totalAmount: 9000,
  paymentMethod: 'Pay at Property',
  status: 'Confirmed',
  createdAt: new Date().toISOString()
};

function testRender(filename, data) {
  const filepath = path.join(viewsDir, filename);
  console.log(`Testing ${filename}...`);
  try {
    const template = fs.readFileSync(filepath, 'utf8');
    ejs.compile(template, { filename: filepath });
    console.log(`  ${filename} compiled successfully!`);
  } catch (err) {
    console.error(`  ERROR compiling ${filename}:`);
    console.error(err.message);
  }
}

testRender('home.ejs', {
  user: mockUser,
  searchQuery: '',
  searchResults: []
});

testRender('listingDetail.ejs', {
  user: mockUser,
  listing: mockListing,
  similarListings: [mockListing],
  galleryImages: []
});

testRender('myBookings.ejs', {
  user: mockUser,
  bookings: [mockBooking]
});
