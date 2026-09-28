import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import Listing from "./models/Listing.js";
import Admin from "./models/Admin.js";
import { dbService } from "./src/dbService.js";
import User from "./models/User.js";
import Booking from "./models/Booking.js";
import isUserLoggedIn from "./middleware/isUserLoggedIn.js";
import isAdminLoggedIn from "./middleware/isAdminLoggedIn.js";
import QRCode from "qrcode";

const app = express();
const port = process.env.PORT || 5050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Middleware =====
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// Direct routes for UPI QR image
app.get(["/images/upi-qr.jpg", "/upi-qr.jpg"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "upi-qr.jpg"));
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const FALLBACK_IMAGES = {
  Hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&fit=crop',
  ],
  Lodge: [
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80&fit=crop',
  ],
  Rental: [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&fit=crop',
  ]
};

function getFallbackImage(category, index = 0) {
  const imgs = FALLBACK_IMAGES[category] || FALLBACK_IMAGES['Hotel'];
  return imgs[index % imgs.length];
}

function getRandomFallback(category) {
  const imgs = FALLBACK_IMAGES[category] || FALLBACK_IMAGES['Hotel'];
  return imgs[Math.floor(Math.random() * imgs.length)];
}

app.locals.getFallbackImage = getFallbackImage;
app.locals.getRandomFallback = getRandomFallback;
app.locals.FALLBACK_IMAGES = FALLBACK_IMAGES;


// ===== MongoDB Atlas Connection & Session Setup =====
const mongoUrl = process.env.mongodb_url;
const isMongoConfigured = Boolean(
  mongoUrl && 
  !mongoUrl.includes("xxxxx") && 
  !mongoUrl.includes("<db_password>") && 
  !mongoUrl.includes("<password>")
);

let isMongoConnected = false;

if (isMongoConfigured) {
  try {
    await mongoose.connect(mongoUrl, { 
      dbName: "stayandaman", 
      serverSelectionTimeoutMS: 4000 
    });
    isMongoConnected = true;
    console.log("✅ Successfully connected to MongoDB Atlas (Database: stayandaman)");
    await dbService.syncLocalUsersToMongo();
  } catch (err) {
    console.error("❌ MongoDB Atlas connection error:", err.message);
    console.log("ℹ️  dbService switched to local JSON DB fallback.");
    console.log("👉 Note: To use MongoDB Atlas, whitelist your current IP address (or 0.0.0.0/0) in MongoDB Atlas > Network Access.");
    dbService.setFallbackActive();
  }
} else {
  console.log("⚠️ MongoDB URL contains placeholder '<db_password>' or is missing. Please update your real MongoDB Atlas password in .env to connect to Atlas.");
  dbService.setFallbackActive();
}

// ===== Session Configuration =====
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "stayandaman-session-secret-key-2026",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  },
};

if (isMongoConnected && mongoose.connection.readyState === 1) {
  try {
    sessionOptions.store = MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: "stayandaman",
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: "native",
    });
  } catch (storeErr) {
    console.warn("⚠️ MongoStore initialization failed, falling back to memory session store:", storeErr.message);
  }
}

app.use(session(sessionOptions));

// ===== Auth Middleware =====
const requireAdmin = isAdminLoggedIn;

// ===== Expose Session data to EJS Views =====
app.use((req, res, next) => {
  res.locals.user = req.session && req.session.userId ? {
    id: req.session.userId,
    _id: req.session.userId,
    fullName: req.session.userFullName,
    email: req.session.userEmail,
    avatar: req.session.userAvatar,
    username: req.session.userUsername
  } : null;

  res.locals.admin = req.session && req.session.adminId ? {
    id: req.session.adminId,
    _id: req.session.adminId,
    fullName: req.session.adminFullName,
    email: req.session.adminEmail,
    avatar: req.session.adminAvatar,
    username: req.session.adminUsername
  } : null;

  next();
});

// =============================================
//  LANDING & PUBLIC ROUTES
// =============================================

app.get("/", (req, res) => {
  res.render("landing");
});

// =============================================
//  USER AUTHENTICATION ROUTES
// =============================================

// User Login GET
app.get("/user/login", (req, res) => {
  if (req.query.redirect) {
    req.session.redirectTo = req.query.redirect;
  }
  if (req.session && req.session.userId) {
    const dest = req.session.redirectTo || "/home/hotel";
    delete req.session.redirectTo;
    return res.redirect(dest);
  }
  let successMsg = null;
  if (req.query.signupSuccess === "true") {
    successMsg = "Account created! Welcome to StayAndaman — just enter your email to sign in."
  }
  res.render("userLogin", {
    error: null,
    success: successMsg,
    oldValues: {},
    redirect: req.query.redirect || (req.session && req.session.redirectTo) || ""
  });
});

// User Login POST (Passwordless: email-only sign-in for returning users)
app.post("/user/login", async (req, res) => {
  const { email, rememberMe, redirect: redirectParam } = req.body;
  const redirectTarget = redirectParam || (req.session && req.session.redirectTo) || "/home/hotel";

  try {
    if (!email) {
      return res.render("userLogin", {
        error: "Please enter your email address.",
        success: null,
        oldValues: { email },
        redirect: redirectTarget
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // 1. Check if user exists by email
    const matchedUser = await dbService.findUserByEmail(trimmedEmail);
    if (!matchedUser) {
      return res.render("userLogin", {
        error: `No account found for "${trimmedEmail}". Please sign up first.`,
        notFoundEmail: trimmedEmail,
        success: null,
        oldValues: { email },
        redirect: redirectTarget
      });
    }

    // 2. Check if account is active
    if (matchedUser.isActive === false) {
      return res.render("userLogin", {
        error: "Your account has been deactivated. Please contact admin.",
        notFoundEmail: null,
        success: null,
        oldValues: { email },
        redirect: redirectTarget
      });
    }

    // Establish session
    req.session.userId = matchedUser._id || matchedUser.id;
    req.session.userFullName = matchedUser.fullName;
    req.session.userEmail = matchedUser.email;
    req.session.userAvatar = matchedUser.avatar || "";
    req.session.userUsername = matchedUser.username;

    // Update lastLogin timestamp
    await dbService.updateUserRecord(matchedUser._id || matchedUser.id, { lastLogin: new Date() });

    if (rememberMe) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // Extend to 7 days
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }

    delete req.session.redirectTo;
    req.session.save((saveErr) => {
      if (saveErr) console.error("Session save error on login:", saveErr);
      res.redirect(redirectTarget);
    });
  } catch (err) {
    console.error("User login error:", err);
    res.render("userLogin", {
      error: "An error occurred during login. Please try again.",
      notFoundEmail: null,
      success: null,
      oldValues: { email },
      redirect: redirectTarget
    });
  }
});

// User Signup GET
app.get("/user/signup", (req, res) => {
  if (req.query.redirect) {
    req.session.redirectTo = req.query.redirect;
  }
  if (req.session && req.session.userId) {
    const dest = req.session.redirectTo || "/home/hotel";
    delete req.session.redirectTo;
    return res.redirect(dest);
  }
  res.render("userSignup", {
    error: null,
    oldValues: { email: req.query.email || "" },
    redirect: req.query.redirect || (req.session && req.session.redirectTo) || ""
  });
});

// User Signup POST
app.post("/user/signup", async (req, res) => {
  console.log("Signup req.body:", req.body);
  const { firstName, lastName, email, phone, gender, dateOfBirth, city, avatar, redirect: redirectParam } = req.body;
  const redirectTarget = redirectParam || (req.session && req.session.redirectTo) || "/home/hotel";

  try {
    if (!firstName || !lastName || !email || !phone || !gender) {
      return res.render("userSignup", {
        error: "Please fill in all required fields.",
        oldValues: req.body,
        redirect: redirectTarget
      });
    }

    const lowercaseEmail = email.toLowerCase().trim();

    // Check unique email
    const existingEmail = await dbService.findUserByEmail(lowercaseEmail);
    if (existingEmail) {
      return res.render("userSignup", {
        error: "Email is already registered.",
        oldValues: req.body,
        redirect: redirectTarget
      });
    }

    // Generate unique username from firstName and lastName
    let baseUsername = `${firstName.trim()}_${lastName.trim()}`.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!baseUsername) {
      baseUsername = "user";
    }
    let lowercaseUsername = baseUsername;
    let existingUsername = await dbService.findUserByUsername(lowercaseUsername);
    let counter = 1;
    while (existingUsername) {
      lowercaseUsername = `${baseUsername}${counter}`;
      existingUsername = await dbService.findUserByUsername(lowercaseUsername);
      counter++;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Create user
    const newUser = await dbService.createUserRecord({
      fullName,
      username: lowercaseUsername,
      email: lowercaseEmail,
      phone,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      city,
      avatar: avatar || "",
      isActive: true,
      createdAt: new Date()
    });

    // Automatically log in the user by establishing a session
    req.session.userId = newUser._id || newUser.id;
    req.session.userFullName = newUser.fullName;
    req.session.userEmail = newUser.email;
    req.session.userAvatar = newUser.avatar || "";
    req.session.userUsername = newUser.username;

    delete req.session.redirectTo;
    req.session.save((saveErr) => {
      if (saveErr) console.error("Session save error on signup:", saveErr);
      res.redirect(redirectTarget);
    });
  } catch (err) {
    console.error("User signup error:", err);
    res.render("userSignup", {
      error: "An error occurred during sign up.",
      oldValues: req.body,
      redirect: redirectTarget
    });
  }
});

// Live Username Availability Check API
app.get("/api/users/check-username", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.json({ available: false });
    }
    const sanitized = username.toLowerCase().trim();
    const existing = await dbService.findUserByUsername(sanitized);
    res.json({ available: !existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/current-user - Return authenticated user state
app.get("/api/auth/current-user", (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        _id: req.session.userId,
        fullName: req.session.userFullName,
        email: req.session.userEmail,
        avatar: req.session.userAvatar || "",
        username: req.session.userUsername
      }
    });
  }
  return res.json({ authenticated: false, user: null });
});

// User Logout POST
app.post("/user/logout", (req, res) => {
  if (req.session) {
    req.session.userId = null;
    req.session.userFullName = null;
    req.session.userEmail = null;
    req.session.userAvatar = null;
    req.session.userUsername = null;

    // Completely destroy session if no admin is logged in
    if (!req.session.adminId) {
      req.session.destroy(() => {
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

// =============================================
//  USER PROFILE & BOOKING PAGES
// =============================================

app.get("/profile", isUserLoggedIn, async (req, res) => {
  try {
    const profileDetails = await dbService.getUserById(req.session.userId);
    res.render("userProfile", { profileDetails, success: null, user: res.locals.user });
  } catch (err) {
    console.error(err);
    res.redirect("/home/hotel");
  }
});

app.post("/profile", isUserLoggedIn, async (req, res) => {
  try {
    const { fullName, phone, gender, dateOfBirth, city, avatar } = req.body;

    if (!fullName || !phone) {
      const profileDetails = await dbService.getUserById(req.session.userId);
      return res.render("userProfile", { profileDetails, success: null });
    }

    const updatedUser = await dbService.updateUserRecord(req.session.userId, {
      fullName,
      phone,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      city,
      avatar: avatar || ""
    });

    req.session.userFullName = updatedUser.fullName;
    req.session.userAvatar = updatedUser.avatar || "";

    res.render("userProfile", { profileDetails: updatedUser, success: "Profile details updated successfully." });
  } catch (err) {
    console.error(err);
    const profileDetails = await dbService.getUserById(req.session.userId);
    res.render("userProfile", { profileDetails, success: null });
  }
});

app.get("/hotels", (req, res) => res.redirect("/home/hotel"));
app.get("/lodges", (req, res) => res.redirect("/home/lodges"));
app.get("/rentals", (req, res) => res.redirect("/home/rentals"));

app.get("/home", (req, res) => res.redirect("/home/hotel"));

app.get("/home/hotel", async (req, res) => {
  try {
    const listings = await dbService.getListings({ category: "Hotel" });
    res.render("hotels", { listings, user: res.locals.user });
  } catch (err) {
    console.error(err);
    res.render("hotels", { listings: [], user: res.locals.user });
  }
});

app.get("/home/rentals", async (req, res) => {
  try {
    const listings = await dbService.getListings({ category: "Rental" });
    res.render("rentals", { listings, user: res.locals.user });
  } catch (err) {
    console.error(err);
    res.render("rentals", { listings: [], user: res.locals.user });
  }
});

app.get("/home/lodges", async (req, res) => {
  try {
    const listings = await dbService.getListings({ category: "Lodge" });
    res.render("lodges", { listings, user: res.locals.user });
  } catch (err) {
    console.error(err);
    res.render("lodges", { listings: [], user: res.locals.user });
  }
});


// =============================================
//  LISTING DETAIL & USER BOOKING ROUTES
// =============================================

// GET /listing/:id - Detail page
app.get("/listing/:id", async (req, res) => {
  try {
    const listing = await dbService.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    // Fetch 3 similar listings of the same category, excluding the current one
    const category = listing.category;
    const allOfCat = await dbService.getListings({ category });
    const similarListings = allOfCat
      .filter(item => (item._id || item.id).toString() !== req.params.id.toString())
      .slice(0, 3);

    // Image Gallery — only include images the admin actually uploaded
    const galleryImages = [];
    if (listing.image) galleryImages.push(listing.image);
    if (listing.image2) galleryImages.push(listing.image2);
    if (listing.image3) galleryImages.push(listing.image3);
    if (listing.image4) galleryImages.push(listing.image4);

    res.render("listingDetail", { listing, similarListings, galleryImages, user: res.locals.user });
  } catch (err) {
    console.error(err);
    res.redirect("/home/hotel");
  }
});

// POST /booking/create - Submit booking directly without forced sign-in redirect
app.post("/booking/create", async (req, res) => {
  try {
    const {
      listingId, listingName, category, location, listingImage,
      guestName, guestEmail, guestPhone,
      checkIn, checkOut, nights, guests, children, roomType,
      pricePerNight, childPricePerNight, subtotal, tax, totalAmount, paymentMethod, specialRequests
    } = req.body;

    // Server-side validation
    if (!guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !roomType) {
      return res.status(400).json({ success: false, error: "Please fill in all required fields." });
    }

    const cleanPhone = (guestPhone || "").replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.trim())) {
      return res.status(400).json({ success: false, error: "Enter a valid email address." });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ success: false, error: "Check-out date must be after check-in." });
    }

    const adultCount = parseInt(guests) || 1;
    const childCount = parseInt(children) || 0;
    const stayNights = parseInt(nights) || 1;
    const adultRate = parseFloat(pricePerNight) || 0;
    const childRate = parseFloat(childPricePerNight) || 0;

    const calculatedSubtotal = (adultRate * adultCount + childRate * childCount) * stayNights;
    const finalSubtotal = parseFloat(subtotal) || calculatedSubtotal;
    const parsedTotal = parseFloat(totalAmount) || finalSubtotal;
    const isOnline = paymentMethod.includes("UPI");

    const trimmedEmail = guestEmail.toLowerCase().trim();
    let assignedUserId = req.session && req.session.userId ? req.session.userId : null;

    // If not logged in in session, link to existing user by email or create user
    if (!assignedUserId) {
      let matchedUser = await dbService.findUserByEmail(trimmedEmail);
      if (!matchedUser) {
        let baseUsername = guestName.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
        let finalUsername = baseUsername;
        let counter = 1;
        while (await dbService.findUserByUsername(finalUsername)) {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }
        matchedUser = await dbService.createUserRecord({
          fullName: guestName.trim(),
          username: finalUsername,
          email: trimmedEmail,
          phone: cleanPhone,
          gender: "Not Specified",
          city: location ? location.split(",")[0] : "Andaman",
          isActive: true,
          createdAt: new Date()
        });
      }
      assignedUserId = matchedUser._id || matchedUser.id;

      // Automatically sign them in so they have an active session
      req.session.userId = assignedUserId;
      req.session.userFullName = matchedUser.fullName;
      req.session.userEmail = matchedUser.email;
      req.session.userAvatar = matchedUser.avatar || "";
      req.session.userUsername = matchedUser.username;
    }

    const cleanSenderUpi = (req.body.senderUpi || req.body.payerUpi || "").trim();
    const cleanSenderBank = (req.body.senderBank || req.body.paymentApp || "UPI App").trim();
    const cleanUtr = (req.body.utr || "").trim();

    let transactionId = null;
    if (isOnline) {
      if (!cleanUtr || cleanUtr.length < 4) {
        return res.status(400).json({ success: false, error: "Please enter the 12-digit UTR / Transaction Reference number from your UPI payment app." });
      }
      if (!cleanSenderUpi) {
        return res.status(400).json({ success: false, error: "Please provide your sender UPI ID or mobile number to verify payment." });
      }
      transactionId = cleanUtr.toUpperCase().startsWith("UTR") ? cleanUtr.toUpperCase() : `UTR-${cleanUtr.toUpperCase()}`;
    }

    const bookingData = {
      listingId,
      listingName,
      category,
      location,
      listingImage: listingImage || "",
      guestName: guestName.trim(),
      guestEmail: trimmedEmail,
      guestPhone: cleanPhone,
      userId: assignedUserId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights: stayNights,
      guests: adultCount,
      children: childCount,
      roomType,
      pricePerNight: adultRate,
      childPricePerNight: childRate,
      subtotal: finalSubtotal,
      tax: parseFloat(tax) || 0,
      totalAmount: parsedTotal,
      paymentMethod,
      paymentStatus: isOnline ? "Paid Online (Verified)" : "Pending (Pay at Property)",
      transactionId: transactionId,
      senderUpi: cleanSenderUpi || (isOnline ? `${cleanPhone}@upi` : ""),
      senderBank: cleanSenderBank,
      beneficiaryName: "Gourab Das",
      beneficiaryBank: "Slice",
      beneficiaryAccount: "033325222636602",
      beneficiaryIfsc: "NESF0000333",
      beneficiaryUpi: "9531820286@slc",
      amountPaid: isOnline ? parsedTotal : 0,
      advancePaid: isOnline ? parsedTotal : 0,
      balanceDue: isOnline ? 0 : parsedTotal,
      specialRequests: specialRequests || "",
      status: "Confirmed"
    };

    const booking = await dbService.createBooking(bookingData);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ success: false, error: "Server error during booking creation." });
  }
});

// GET /api/upi-qr - Generate PNG QR code for UPI payments
app.get("/api/upi-qr", async (req, res) => {
  try {
    const rawAmount = req.query.amount ? parseFloat(req.query.amount) : 0;
    const vpa = req.query.vpa || "9531820286@slc";
    const name = req.query.name || "Gourab Das";
    
    // Construct standard UPI intent URI
    let upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&cu=INR`;
    if (rawAmount > 0) {
      upiUri += `&am=${rawAmount.toFixed(2)}`;
    }

    const pngBuffer = await QRCode.toBuffer(upiUri, {
      type: "png",
      width: 280,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(pngBuffer);
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).send("Error generating QR code");
  }
});

// GET /my-bookings - User bookings dashboard
app.get("/my-bookings", async (req, res) => {
  try {
    const queryEmail = (req.query.email || "").toLowerCase().trim();
    let sessionUserId = req.session ? req.session.userId : null;
    let sessionEmail = req.session ? req.session.userEmail : null;
    let effectiveEmail = queryEmail || sessionEmail;

    // If query email provided and user not logged in, auto-login if user exists
    if (queryEmail && !sessionUserId) {
      const matchedUser = await dbService.findUserByEmail(queryEmail);
      if (matchedUser) {
        req.session.userId = matchedUser._id || matchedUser.id;
        req.session.userFullName = matchedUser.fullName;
        req.session.userEmail = matchedUser.email;
        req.session.userAvatar = matchedUser.avatar || "";
        req.session.userUsername = matchedUser.username;
        sessionUserId = req.session.userId;
        sessionEmail = req.session.userEmail;
      }
    }

    let bookings = [];
    if (sessionUserId || effectiveEmail) {
      bookings = await dbService.getBookingsByUser(sessionUserId, effectiveEmail);
    }

    res.render("myBookings", { 
      bookings,
      searchEmail: effectiveEmail || "",
      user: res.locals.user
    });
  } catch (err) {
    console.error("Fetch my-bookings error:", err);
    res.render("myBookings", { bookings: [], searchEmail: "", user: res.locals.user });
  }
});

// POST /booking/cancel/:id - Cancel stay booking
app.post("/booking/cancel/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    await dbService.updateBookingStatus(bookingId, "Cancelled");
    res.json({ success: true });
  } catch (err) {
    console.error("Booking cancellation failed:", err);
    res.status(500).json({ success: false, error: "Server error during cancellation." });
  }
});

// =============================================
//  ADMIN AUTHENTICATION ROUTES
// =============================================

// Admin Login GET
app.get("/admin/login", (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }
  const successMsg = req.query.signupSuccess === "true" ? "Account created! You can now log in." : null;
  res.render("adminLogin", { error: null, success: successMsg, oldValues: {} });
});

// Admin Login POST
app.post("/admin/login", async (req, res) => {
  const { username, email } = req.body;
  try {
    if (!username || !email) {
      return res.render("adminLogin", {
        error: "Please enter both admin username and email.",
        success: null,
        oldValues: { username, email }
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.toLowerCase().trim();

    // 1. Check if admin exists
    const adminByUsername = await dbService.findAdminByUsername(trimmedUsername);
    if (!adminByUsername) {
      return res.render("adminLogin", {
        error: "Admin not found. Contact super admin.",
        success: null,
        oldValues: { username, email }
      });
    }

    // 2. Check if username and email match same record
    const matchedAdmin = await dbService.findAdminByUsernameAndEmail(trimmedUsername, trimmedEmail);
    if (!matchedAdmin) {
      return res.render("adminLogin", {
        error: "Email does not match this admin username",
        success: null,
        oldValues: { username, email }
      });
    }

    // Create session
    req.session.adminId = matchedAdmin._id || matchedAdmin.id;
    req.session.adminFullName = matchedAdmin.fullName;
    req.session.adminEmail = matchedAdmin.email;
    req.session.adminAvatar = matchedAdmin.avatar || "";
    req.session.adminUsername = matchedAdmin.username;

    // Update lastLogin
    await dbService.updateAdminRecord(matchedAdmin._id || matchedAdmin.id, { lastLogin: new Date() });

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Admin login error:", err);
    res.render("adminLogin", {
      error: "An error occurred during admin login.",
      success: null,
      oldValues: { username, email }
    });
  }
});

// Admin Signup GET (Hidden Page)
app.get("/admin/signup", (req, res) => {
  res.render("adminSignup", { error: null, oldValues: {} });
});

// Admin Signup POST
app.post("/admin/signup", async (req, res) => {
  const { fullName, username, email, phone, secretCode } = req.body;
  try {
    if (!fullName || !username || !email || !secretCode) {
      return res.render("adminSignup", {
        error: "Please fill in all required fields.",
        oldValues: req.body
      });
    }

    const requiredCode = (process.env.ADMIN_SECRET_CODE || "RIMI@162").trim();
    if (secretCode.trim() !== requiredCode) {
      return res.render("adminSignup", {
        error: "Invalid admin access code",
        oldValues: req.body
      });
    }

    const trimmedUsername = username.trim();
    const lowercaseEmail = email.toLowerCase().trim();

    // Check unique username
    const existingAdminByUsername = await dbService.findAdminByUsername(trimmedUsername);
    if (existingAdminByUsername) {
      return res.render("adminSignup", {
        error: "Admin username is already taken.",
        oldValues: req.body
      });
    }

    // Check unique email
    const existingAdminByEmail = await dbService.findAdminByEmail(lowercaseEmail);
    if (existingAdminByEmail) {
      return res.render("adminSignup", {
        error: "Admin email is already registered.",
        oldValues: req.body
      });
    }

    // Create admin
    await dbService.createAdminRecord({
      fullName,
      username: trimmedUsername,
      email: lowercaseEmail,
      phone: phone || "",
      avatar: "",
      createdAt: new Date()
    });

    res.redirect("/admin/login?signupSuccess=true");
  } catch (err) {
    console.error("Admin signup error:", err);
    res.render("adminSignup", {
      error: "An error occurred during registration.",
      oldValues: req.body
    });
  }
});

// Admin Logout POST
app.post("/admin/logout", (req, res) => {
  if (req.session) {
    req.session.adminId = null;
    req.session.adminFullName = null;
    req.session.adminEmail = null;
    req.session.adminAvatar = null;
    req.session.adminUsername = null;

    // Completely destroy session if no user is logged in
    if (!req.session.userId) {
      req.session.destroy(() => {
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});


// =============================================
//  ADMIN PAGES (Protected)
// =============================================

app.get("/admin/dashboard", requireAdmin, (req, res) => {
  res.render("adminDashboard", { activePage: "overview" });
});

app.get("/admin/listings", requireAdmin, (req, res) => {
  res.render("adminDashboard", { activePage: "hotels" });
});

app.get("/admin/users", requireAdmin, (req, res) => {
  res.render("adminDashboard", { activePage: "users" });
});

app.get("/admin/profile", requireAdmin, (req, res) => {
  res.render("adminDashboard", { activePage: "profile" });
});


// =============================================
//  API ROUTES (for Admin Dashboard AJAX)
// =============================================

// GET all listings
app.get("/api/listings", async (req, res) => {
  try {
    const listings = await dbService.getListings();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// GET single listing
app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await dbService.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

// POST create listing
app.post("/api/listings", requireAdmin, async (req, res) => {
  try {
    const listing = await dbService.createListing(req.body);
    res.status(201).json(listing);
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(400).json({ error: err.message });
  }
});

// PUT update listing
app.put("/api/listings/:id", requireAdmin, async (req, res) => {
  try {
    const listing = await dbService.updateListing(req.params.id, req.body);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE listing
app.delete("/api/listings/:id", requireAdmin, async (req, res) => {
  try {
    const listing = await dbService.deleteListing(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

// GET admin bookings dashboard tab view
app.get("/admin/bookings", requireAdmin, (req, res) => {
  res.render("adminDashboard", { activePage: "bookings" });
});

// GET JSON list of bookings for admin
app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const bookings = await dbService.getAllBookings();
    res.json(bookings);
  } catch (err) {
    console.error("Fetch bookings failed:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// POST update booking status from admin
app.post("/admin/booking/status/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value" });
    }
    await dbService.updateBookingStatus(req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin status update error:", err);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

// POST delete booking record from admin
app.post("/admin/booking/delete/:id", requireAdmin, async (req, res) => {
  try {
    await dbService.deleteBooking(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin booking delete error:", err);
    res.status(500).json({ success: false, error: "Failed to delete booking record" });
  }
});

// GET export bookings CSV
app.get("/api/admin/bookings/export", requireAdmin, async (req, res) => {
  try {
    const bookings = await dbService.getAllBookings();
    const headers = ["Booking ID", "Property", "Category", "Guest Name", "Email", "Phone", "Check-in", "Check-out", "Nights", "Guests", "Total Amount (INR)", "Payment Method", "Status", "Booked Date"];
    const csvRows = [headers.join(",")];
    for (const b of bookings) {
      const row = [
        `"${b.bookingId}"`,
        `"${(b.listingName || '').replace(/"/g, '""')}"`,
        `"${b.category}"`,
        `"${(b.guestName || '').replace(/"/g, '""')}"`,
        `"${(b.guestEmail || '').replace(/"/g, '""')}"`,
        `"${b.guestPhone}"`,
        `"${b.checkIn ? new Date(b.checkIn).toISOString().split('T')[0] : ''}"`,
        `"${b.checkOut ? new Date(b.checkOut).toISOString().split('T')[0] : ''}"`,
        b.nights,
        b.guests,
        b.totalAmount,
        `"${b.paymentMethod}"`,
        `"${b.status}"`,
        `"${b.createdAt ? new Date(b.createdAt).toISOString() : ''}"`
      ];
      csvRows.push(row.join(","));
    }
    const csvString = csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvString);
  } catch (err) {
    console.error("Bookings CSV Export failed:", err);
    res.status(500).send("Export failed");
  }
});

// GET all users (Admin view)
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Fetch admin users failed:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// TOGGLE active status of user
app.put("/api/admin/users/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const user = await dbService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await dbService.updateUserRecord(req.params.id, { isActive: !user.isActive });
    res.json(updated);
  } catch (err) {
    console.error("Toggle user active state error:", err);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// DELETE user
app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await dbService.deleteUserRecord(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// EXPORT users CSV
app.get("/api/admin/users/export", requireAdmin, async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    const headers = ["Name", "Username", "Email", "Phone", "Gender", "City", "Date of Birth", "Joined Date", "Last Login"];
    const csvRows = [headers.join(",")];
    for (const u of users) {
      const row = [
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${(u.username || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.phone || '').replace(/"/g, '""')}"`,
        `"${(u.gender || '').replace(/"/g, '""')}"`,
        `"${(u.city || '').replace(/"/g, '""')}"`,
        `"${u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : ''}"`,
        `"${u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : ''}"`,
        `"${u.lastLogin ? new Date(u.lastLogin).toISOString() : ''}"`
      ];
      csvRows.push(row.join(","));
    }
    const csvString = csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvString);
  } catch (err) {
    console.error("CSV Export failed:", err);
    res.status(500).send("Export failed");
  }
});

// GET admin profile details
app.get("/api/admin/profile", requireAdmin, async (req, res) => {
  try {
    const profile = await dbService.getAdminProfile(req.session.adminId);
    res.json(profile);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT update admin profile details
app.put("/api/admin/profile", requireAdmin, async (req, res) => {
  try {
    const profile = await dbService.updateAdminProfile(req.session.adminId, req.body);
    // Sync update to currently active session
    req.session.adminFullName = profile.displayName;
    req.session.adminAvatar = profile.avatar || "";
    res.json(profile);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(400).json({ error: err.message });
  }
});


// =============================================
//  START SERVER
// =============================================

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});