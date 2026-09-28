import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_DB_PATH = path.join(__dirname, "db.json");

let useJsonDb = false;

// Determine if we should use the JSON fallback based on connection URL
const mongoUrl = process.env.mongodb_url;
if (!mongoUrl || mongoUrl.includes("xxxxx") || mongoUrl.includes("<db_password>") || mongoUrl.includes("<password>")) {
  useJsonDb = true;
}

// Initial structure for JSON db
const defaultDb = {
  users: [],
  listings: [],
  bookings: [],
  admins: [
    {
      id: "1",
      fullName: "Super Admin",
      username: "admin",
      email: "admin@stayandaman.com",
      phone: "+91 98765 43210",
      avatar: "",
      location: "Shimla, India",
      website: "https://stayandaman.com",
      bio: "Stayandaman Administrator",
      createdAt: "2025-01-01",
      lastLogin: null
    }
  ]
};

// Helper to read JSON DB
function readJsonDb() {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
    const data = fs.readFileSync(JSON_DB_PATH, "utf8");
    const db = JSON.parse(data);
    if (!db.users) db.users = [];
    if (!db.admins) db.admins = [];
    if (!db.listings) db.listings = [];
    if (!db.bookings) db.bookings = [];
    return db;
  } catch (err) {
    console.error("Error reading JSON DB:", err);
    return defaultDb;
  }
}

// Helper to write JSON DB
function writeJsonDb(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing JSON DB:", err);
  }
}

export const dbService = {
  setFallbackActive() {
    if (!useJsonDb) {
      useJsonDb = true;
      console.log("dbService switched to local JSON DB fallback.");
    }
  },
  
  isFallback() {
    return useJsonDb;
  },

  async syncLocalUsersToMongo() {
    try {
      const db = readJsonDb();
      if (db.users && db.users.length > 0) {
        for (const u of db.users) {
          if (!u.email) continue;
          const exists = await User.findOne({ email: u.email.toLowerCase().trim() });
          if (!exists) {
            const { _id, id, ...userData } = u;
            await User.create(userData);
            console.log(`[MongoDB Atlas] Synced user: ${u.email}`);
          }
        }
      }
      if (db.listings && db.listings.length > 0) {
        const count = await Listing.countDocuments();
        if (count === 0) {
          for (const l of db.listings) {
            const { _id, id, ...listingData } = l;
            await Listing.create(listingData);
          }
          console.log(`[MongoDB Atlas] Synced ${db.listings.length} listings`);
        }
      }
    } catch (err) {
      console.error("MongoDB sync error:", err.message);
    }
  },

  // ===== Listings operations =====
  async getListings(filter = {}) {
    if (!useJsonDb) {
      try {
        return await Listing.find(filter).sort({ createdAt: -1 });
      } catch (err) {
        console.error("Mongoose getListings failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }
    
    const db = readJsonDb();
    let items = db.listings;
    if (filter.category) {
      items = items.filter(item => item.category === filter.category);
    }
    return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getListingById(id) {
    if (!useJsonDb) {
      try {
        if (mongoose.isValidObjectId(id)) {
          const item = await Listing.findById(id);
          if (item) return item;
        }
      } catch (err) {
        console.error("Mongoose getListingById failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    const cleanId = String(id).trim();
    return db.listings.find(item => 
      String(item._id || item.id).trim() === cleanId || 
      item._id === id || 
      item.id === id
    ) || null;
  },

  async createListing(data) {
    if (!useJsonDb) {
      try {
        const listing = new Listing(data);
        return await listing.save();
      } catch (err) {
        console.error("Mongoose createListing failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    const newListing = {
      _id: "json_" + Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString()
    };
    db.listings.push(newListing);
    writeJsonDb(db);
    return newListing;
  },

  async updateListing(id, data) {
    if (!useJsonDb) {
      try {
        if (mongoose.isValidObjectId(id)) {
          const updated = await Listing.findByIdAndUpdate(id, data, { new: true, runValidators: true });
          if (updated) return updated;
        }
      } catch (err) {
        console.error("Mongoose updateListing failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    const cleanId = String(id).trim();
    const idx = db.listings.findIndex(item => 
      String(item._id || item.id).trim() === cleanId || 
      item._id === id || 
      item.id === id
    );
    if (idx === -1) return null;
    
    db.listings[idx] = {
      ...db.listings[idx],
      ...data,
      _id: db.listings[idx]._id || db.listings[idx].id || cleanId
    };
    writeJsonDb(db);
    return db.listings[idx];
  },

  async deleteListing(id) {
    if (!useJsonDb) {
      try {
        if (mongoose.isValidObjectId(id)) {
          const deleted = await Listing.findByIdAndDelete(id);
          if (deleted) return deleted;
        }
      } catch (err) {
        console.error("Mongoose deleteListing failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    const cleanId = String(id).trim();
    const idx = db.listings.findIndex(item => 
      String(item._id || item.id).trim() === cleanId || 
      item._id === id || 
      item.id === id
    );
    if (idx === -1) return null;
    const deleted = db.listings.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  },

  // ===== Legacy/Dashboard Admin Profile compatibility functions =====
  async getAdminProfile(adminId) {
    if (!useJsonDb) {
      try {
        let admin = null;
        if (adminId) {
          admin = await Admin.findById(adminId);
        }
        if (!admin) {
          admin = await Admin.findOne({ username: "admin" });
        }
        if (!admin) {
          admin = new Admin({
            fullName: "Super Admin",
            username: "admin",
            email: "admin@stayandaman.com",
            phone: "+91 98765 43210",
            location: "Shimla, India",
            website: "https://stayandaman.com",
            bio: "Stayandaman Administrator"
          });
          await admin.save();
        }
        return {
          username: admin.username,
          displayName: admin.fullName,
          email: admin.email,
          phone: admin.phone,
          location: admin.location,
          website: admin.website,
          bio: admin.bio,
          avatar: admin.avatar
        };
      } catch (err) {
        console.error("Mongoose getAdminProfile failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    let admin = null;
    if (adminId) {
      admin = db.admins.find(a => a._id === adminId || a.id === adminId);
    }
    if (!admin) {
      admin = db.admins.find(a => a.username === "admin");
    }
    if (!admin) {
      admin = {
        id: "1",
        fullName: "Super Admin",
        username: "admin",
        email: "admin@stayandaman.com",
        phone: "+91 98765 43210",
        location: "Shimla, India",
        website: "https://stayandaman.com",
        bio: "Stayandaman Administrator",
        avatar: "",
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      db.admins.push(admin);
      writeJsonDb(db);
    }
    return {
      username: admin.username,
      displayName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      location: admin.location,
      website: admin.website,
      bio: admin.bio,
      avatar: admin.avatar
    };
  },

  async updateAdminProfile(adminId, data) {
    if (!useJsonDb) {
      try {
        let admin = null;
        if (adminId) {
          admin = await Admin.findById(adminId);
        }
        if (!admin) {
          admin = await Admin.findOne({ username: "admin" });
        }
        if (!admin) {
          admin = new Admin({ username: "admin", fullName: data.displayName || "Admin", email: data.email });
        }
        admin.fullName = data.displayName || admin.fullName;
        admin.email = data.email || admin.email;
        admin.phone = data.phone || admin.phone;
        admin.location = data.location || admin.location;
        admin.website = data.website || admin.website;
        admin.bio = data.bio || admin.bio;
        admin.avatar = data.avatar || admin.avatar;
        await admin.save();
        return {
          username: admin.username,
          displayName: admin.fullName,
          email: admin.email,
          phone: admin.phone,
          location: admin.location,
          website: admin.website,
          bio: admin.bio,
          avatar: admin.avatar
        };
      } catch (err) {
        console.error("Mongoose updateAdminProfile failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    let idx = -1;
    if (adminId) {
      idx = db.admins.findIndex(a => a._id === adminId || a.id === adminId);
    }
    if (idx === -1) {
      idx = db.admins.findIndex(a => a.username === "admin");
    }
    if (idx === -1) {
      const newAdmin = {
        id: adminId || "json_admin_" + Math.random().toString(36).substr(2, 9),
        fullName: data.displayName || "Admin",
        username: "admin",
        email: data.email || "admin@stayandaman.com",
        phone: data.phone || "",
        location: data.location || "",
        website: data.website || "",
        bio: data.bio || "",
        avatar: data.avatar || "",
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      db.admins.push(newAdmin);
      writeJsonDb(db);
      return {
        username: newAdmin.username,
        displayName: newAdmin.fullName,
        email: newAdmin.email,
        phone: newAdmin.phone,
        location: newAdmin.location,
        website: newAdmin.website,
        bio: newAdmin.bio,
        avatar: newAdmin.avatar
      };
    }
    
    db.admins[idx] = {
      ...db.admins[idx],
      fullName: data.displayName || db.admins[idx].fullName,
      email: data.email || db.admins[idx].email,
      phone: data.phone || db.admins[idx].phone,
      location: data.location || db.admins[idx].location,
      website: data.website || db.admins[idx].website,
      bio: data.bio || db.admins[idx].bio,
      avatar: data.avatar || db.admins[idx].avatar
    };
    writeJsonDb(db);
    return {
      username: db.admins[idx].username,
      displayName: db.admins[idx].fullName,
      email: db.admins[idx].email,
      phone: db.admins[idx].phone,
      location: db.admins[idx].location,
      website: db.admins[idx].website,
      bio: db.admins[idx].bio,
      avatar: db.admins[idx].avatar
    };
  },

  // ===== User Operations (Legacy wrappers for safety) =====
  async getUsers(filter = {}) {
    return this.getAllUsers(filter);
  },

  async getUserById(id) {
    if (!useJsonDb) {
      try {
        return await User.findById(id);
      } catch (err) {
        console.error("Mongoose getUserById failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.users.find(item => item._id === id || item.id === id) || null;
  },

  async getUserByEmail(email) {
    return this.findUserByEmail(email);
  },

  async createUser(data) {
    return this.createUserRecord(data);
  },

  async updateUser(id, data) {
    return this.updateUserRecord(id, data);
  },

  async deleteUser(id) {
    return this.deleteUserRecord(id);
  },

  // ===== Newly Requested Functions for both User and Admin =====
  
  // 1. findByUsernameAndEmail(username, email)
  async findUserByUsernameAndEmail(username, email) {
    if (!username || !email) return null;
    if (!useJsonDb) {
      try {
        return await User.findOne({
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim()
        });
      } catch (err) {
        console.error("Mongoose findUserByUsernameAndEmail failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.users.find(u => 
      u.username && u.email &&
      u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
      u.email.toLowerCase().trim() === email.toLowerCase().trim()
    ) || null;
  },

  async findAdminByUsernameAndEmail(username, email) {
    if (!username || !email) return null;
    if (!useJsonDb) {
      try {
        return await Admin.findOne({
          username: username.trim(), // Note: Admin username is case-sensitive or standard
          email: email.toLowerCase().trim()
        });
      } catch (err) {
        console.error("Mongoose findAdminByUsernameAndEmail failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.admins.find(a => 
      a.username && a.email &&
      a.username.trim() === username.trim() && 
      a.email.toLowerCase().trim() === email.toLowerCase().trim()
    ) || null;
  },

  // 2. findByUsername(username)
  async findUserByUsername(username) {
    if (!username) return null;
    if (!useJsonDb) {
      try {
        return await User.findOne({ username: username.toLowerCase().trim() });
      } catch (err) {
        console.error("Mongoose findUserByUsername failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.users.find(u => u.username && u.username.toLowerCase().trim() === username.toLowerCase().trim()) || null;
  },

  async findAdminByUsername(username) {
    if (!username) return null;
    if (!useJsonDb) {
      try {
        return await Admin.findOne({ username: username.trim() });
      } catch (err) {
        console.error("Mongoose findAdminByUsername failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.admins.find(a => a.username && a.username.trim() === username.trim()) || null;
  },

  // 3. findByEmail(email)
  async findUserByEmail(email) {
    if (!email) return null;
    if (!useJsonDb) {
      try {
        return await User.findOne({ email: email.toLowerCase().trim() });
      } catch (err) {
        console.error("Mongoose findUserByEmail failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.users.find(u => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  },

  async findAdminByEmail(email) {
    if (!email) return null;
    if (!useJsonDb) {
      try {
        return await Admin.findOne({ email: email.toLowerCase().trim() });
      } catch (err) {
        console.error("Mongoose findAdminByEmail failed:", err.message);
      }
    }
    const db = readJsonDb();
    return db.admins.find(a => a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  },

  // 4. createRecord(data)
  async createUserRecord(data) {
    if (!useJsonDb) {
      try {
        const user = new User(data);
        return await user.save();
      } catch (err) {
        console.error("Mongoose createUserRecord failed:", err.message);
      }
    }
    const db = readJsonDb();
    const newUser = {
      _id: "json_user_" + Math.random().toString(36).substr(2, 9),
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
    };
    db.users.push(newUser);
    writeJsonDb(db);
    return newUser;
  },

  async createAdminRecord(data) {
    if (!useJsonDb) {
      try {
        const admin = new Admin(data);
        return await admin.save();
      } catch (err) {
        console.error("Mongoose createAdminRecord failed:", err.message);
      }
    }
    const db = readJsonDb();
    const newAdmin = {
      _id: "json_admin_" + Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
    };
    db.admins.push(newAdmin);
    writeJsonDb(db);
    return newAdmin;
  },

  // 5. updateRecord(id, data)
  async updateUserRecord(id, data) {
    if (!useJsonDb) {
      try {
        return await User.findByIdAndUpdate(id, data, { new: true });
      } catch (err) {
        console.error("Mongoose updateUserRecord failed:", err.message);
      }
    }
    const db = readJsonDb();
    const idx = db.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return null;
    db.users[idx] = {
      ...db.users[idx],
      ...data
    };
    writeJsonDb(db);
    return db.users[idx];
  },

  async updateAdminRecord(id, data) {
    if (!useJsonDb) {
      try {
        return await Admin.findByIdAndUpdate(id, data, { new: true });
      } catch (err) {
        console.error("Mongoose updateAdminRecord failed:", err.message);
      }
    }
    const db = readJsonDb();
    const idx = db.admins.findIndex(a => a._id === id || a.id === id);
    if (idx === -1) return null;
    db.admins[idx] = {
      ...db.admins[idx],
      ...data
    };
    writeJsonDb(db);
    return db.admins[idx];
  },

  // 6. deleteRecord(id)
  async deleteUserRecord(id) {
    if (!useJsonDb) {
      try {
        return await User.findByIdAndDelete(id);
      } catch (err) {
        console.error("Mongoose deleteUserRecord failed:", err.message);
      }
    }
    const db = readJsonDb();
    const idx = db.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return null;
    const deleted = db.users.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  },

  async deleteAdminRecord(id) {
    if (!useJsonDb) {
      try {
        return await Admin.findByIdAndDelete(id);
      } catch (err) {
        console.error("Mongoose deleteAdminRecord failed:", err.message);
      }
    }
    const db = readJsonDb();
    const idx = db.admins.findIndex(a => a._id === id || a.id === id);
    if (idx === -1) return null;
    const deleted = db.admins.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  },

  // 7. getAllUsers() & getAllAdmins()
  async getAllUsers(filter = {}) {
    if (!useJsonDb) {
      try {
        return await User.find(filter).sort({ createdAt: -1 });
      } catch (err) {
        console.error("Mongoose getAllUsers failed:", err.message);
      }
    }
    const db = readJsonDb();
    let items = db.users || [];
    if (filter.gender) {
      items = items.filter(item => item.gender === filter.gender);
    }
    if (filter.city) {
      items = items.filter(item => item.city && item.city.toLowerCase().includes(filter.city.toLowerCase()));
    }
    return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getAllAdmins(filter = {}) {
    if (!useJsonDb) {
      try {
        return await Admin.find(filter).sort({ createdAt: -1 });
      } catch (err) {
        console.error("Mongoose getAllAdmins failed:", err.message);
      }
    }
    const db = readJsonDb();
    return [...(db.admins || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // ===== Booking Operations =====
  async createBooking(data) {
    // Generate Booking ID: SE-YYYY-XXXX (random 4 digit)
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `SE-${year}-${rand}`;
    const bookingData = { ...data, bookingId };

    if (!useJsonDb) {
      try {
        const booking = new Booking(bookingData);
        return await booking.save();
      } catch (err) {
        console.error("Mongoose createBooking failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    if (!db.bookings) db.bookings = [];
    const newBooking = {
      _id: "json_book_" + Math.random().toString(36).substr(2, 9),
      status: "Confirmed",
      specialRequests: "",
      listingImage: "",
      userId: null,
      ...bookingData,
      createdAt: new Date().toISOString()
    };
    db.bookings.push(newBooking);
    writeJsonDb(db);
    return newBooking;
  },

  async getAllBookings() {
    if (!useJsonDb) {
      try {
        return await Booking.find().sort({ createdAt: -1 });
      } catch (err) {
        console.error("Mongoose getAllBookings failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    if (!db.bookings) db.bookings = [];
    return [...db.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getBookingsByUser(userId, email) {
    if (!useJsonDb) {
      try {
        const query = [];
        if (userId) query.push({ userId });
        if (email) query.push({ guestEmail: new RegExp(`^${email.trim()}$`, "i") });
        if (query.length > 0) {
          return await Booking.find({ $or: query }).sort({ createdAt: -1 });
        }
        return [];
      } catch (err) {
        console.error("Mongoose getBookingsByUser failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    if (!db.bookings) db.bookings = [];
    const normalizedUserId = userId ? userId.toString() : null;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    return db.bookings
      .filter(b => {
        const bUser = b.userId ? b.userId.toString() : null;
        const bEmail = b.guestEmail ? b.guestEmail.toLowerCase().trim() : null;
        const matchUser = normalizedUserId && bUser && bUser === normalizedUserId;
        const matchEmail = normalizedEmail && bEmail && bEmail === normalizedEmail;
        return matchUser || matchEmail;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getBookingsByListing(listingId) {
    if (!useJsonDb) {
      try {
        return await Booking.find({ listingId }).sort({ createdAt: -1 });
      } catch (err) {
        console.error("Mongoose getBookingsByListing failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    if (!db.bookings) db.bookings = [];
    return db.bookings
      .filter(b => b.listingId === listingId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateBookingStatus(id, status) {
    if (!useJsonDb) {
      try {
        return await Booking.findByIdAndUpdate(id, { status }, { new: true });
      } catch (err) {
        console.error("Mongoose updateBookingStatus failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    if (!db.bookings) db.bookings = [];
    const idx = db.bookings.findIndex(item => item._id === id || item.id === id || item.bookingId === id);
    if (idx === -1) return null;
    db.bookings[idx].status = status;
    writeJsonDb(db);
    return db.bookings[idx];
  },

  async deleteBooking(id) {
    if (!useJsonDb) {
      try {
        return await Booking.findByIdAndDelete(id);
      } catch (err) {
        console.error("Mongoose deleteBooking failed, falling back:", err.message);
        dbService.setFallbackActive();
      }
    }

    const db = readJsonDb();
    if (!db.bookings) db.bookings = [];
    const idx = db.bookings.findIndex(item => item._id === id || item.id === id || item.bookingId === id);
    if (idx === -1) return null;
    const deleted = db.bookings.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
};
