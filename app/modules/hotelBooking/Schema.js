const mongoose = require('mongoose');
const schema = mongoose.Schema;

// Hotel Schema
const hotel = new schema({
    name: { type: String },
    totalRooms: { type: Number }
}, { timestamps: true });

const Hotels = mongoose.model('hotels', hotel);


// Reservation Schema
const reservation = new schema({
    hotelId: { type: schema.Types.ObjectId, ref: 'hotels' },
    userId: { type: schema.Types.ObjectId, ref: 'users' },
    arrivalDate: { type: Date },
    departureDate: { type: Date },
    Status: { type: String, enum: ["active", "cancelled"], default: "active" },
    baseStayAmount: { type: String },
    taxAmount: { type: String }
}, { timestamps: true });

const Reservations = mongoose.model('reservations', reservation);


// Users schema
const user = new schema({
    name: { type: String },
    emailId: { type: String }
}, { timestamps: true });

const Users = mongoose.model('users', user);

module.exports = {
    Hotels,
    Reservations,
    Users
}