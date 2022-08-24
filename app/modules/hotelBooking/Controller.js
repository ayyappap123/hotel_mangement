const _ = require("lodash");
const Controller = require("../Base/Controller");
const Hotels = require('./Schema').Hotels;
const Users = require('./Schema').Users;
const Reservation = require('./Schema').Reservations;
const Model = require("../Base/Model");

class HotelController extends Controller {

    constructor() {
        super();
    }

    /********************************************************
        Purpose     :   Add Hotel
        Parameter   :   {
            name        :   "xyz",
            totalRooms  :   2019
        }
        Return  :   JSON String
    ********************************************************/
    async addHotel() {
        try {
            if (!this.req.body.name || !this.req.body.totalRooms) {
                return this.res.send({ status: 0, message: "Please send proper request parameter." })
            }
            let data = this.req.body;
            const newHotel = await new Model(Hotels).store(data);
            if (newHotel.length == 0) {
                return this.res.send({ status: 0, message: "Hotel Details Not saved." })
            }
            return this.res.send({ status: 1, message: "Hotel Details Inserted successfully." });
        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
        Purpose     :   Create Reservation
        Parameter   :   {
            name        :   "xyz",
            totalRooms  :   2019
        }
        Return  :   JSON String
    ********************************************************/
    async createReservation() {
        try {
            if (!this.req.body.hotelId || !this.req.body.name || !this.req.body.emailId || !this.req.body.arrivalDate || !this.req.body.departureDate || !this.req.body.baseStayAmount || !this.req.body.taxAmount) {
                return this.res.send({ status: 0, message: "Please send proper request parameter." })
            }
            const checkHotel = await Hotels.findOne({ _id: this.req.body.hotelId });
            if (_.isEmpty(checkHotel)) {
                return this.res.send({ status: 0, message: "No Hotel found. Please select another hotel" })
            }
            // Adding Guest
            let guest = {
                name: this.req.body.name,
                emailId: this.req.body.emailId
            };
            let d1 = new Date(this.req.body.arrivalDate);
            let d2 = new Date(this.req.body.departureDate);
            if (d1 > d2) {
                return this.res.send({ status: 0, message: "Departure Date should be greater than arrival date" })
            }
            const newGuest = await new Model(Users).store(guest);
            if (newGuest.length == 0) {
                return this.res.send({ status: 0, message: "Guest Details Not saved." })
            }
            // New reservation
            let data = this.req.body;
            data.userId = newGuest._id
            const newHotel = await new Model(Reservation).store(data);
            if (newHotel.length == 0) {
                return this.res.send({ status: 0, message: "Reservation Not Done. Please try again" })
            }
            return this.res.send({ status: 1, message: "Reservation done successfully." });
        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
        Purpose     :   Get All reservations
        Parameter   :   {
            page        :   1,
            pageSize    :   10
        }
        Return  : Array of JSON Objects
    ********************************************************/
    async allReservations() {
        try {
            let page = this.req.body.page;
            let pageSize = this.req.body.pageSize;
            let skip = (Number(page) - 1) * (Number(pageSize));
            let aggregatePipeArr = [];
            aggregatePipeArr.push({ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "users" } });
            aggregatePipeArr.push({ $lookup: { from: "hotels", localField: "hotelId", foreignField: "_id", as: "hotels" } });
            let project = {
                $project: {
                    reservationId: '$_id',
                    guestMemberId: '$userId',
                    guestName: { "$arrayElemAt": ["$users.name", 0] },
                    guestEmail: { "$arrayElemAt": ["$users.emailId", 0] },
                    hotelName: { "$arrayElemAt": ["$hotels.name", 0] },
                    departureDate: '$departureDate',
                    arrivalDate: '$arrivalDate',
                    Status: '$Status',
                    baseStayAmount: '$baseStayAmount',
                    taxAmount: '$taxAmount'
                }
            };
            aggregatePipeArr.push(project);
            aggregatePipeArr.push({
                $sort: { createdAt: 1 }
            });
            aggregatePipeArr.push({ $skip: skip }, { $limit: pageSize })
            let listing = await Reservation.aggregate(aggregatePipeArr);
            let total = await Reservation.countDocuments();
            return this.res.send({ status: 1, message: "Reservation Details found.", data: listing, page: page, pageSize: pageSize, total: total });
        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: 'Something went wrong.' });
        }
    }

    /********************************************************
        Purpose     :   Get reservation by id
        Parameter   :   {
            reservationId:"6303bb3e22b4772aeea380f2" in params
        }
        Return  :   JSON Object
    ********************************************************/
    async reservationsById() {
        try {
            let reservationId = this.req.params.reservationId;
            let checkReservation = await Reservation.findOne({ _id: reservationId }).populate('hotelId', { _id: 1, name: 1, totalRooms: 1 }).populate('userId', { _id: 1, name: 1, emailId: 1 }).exec()
            return this.res.send({ status: 1, message: "Reservation Details found.", data: checkReservation });
        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: 'Something went wrong.' });
        }
    }

    /********************************************************
        Purpose     :   Cancel reservation by id
        Parameter   :   {
            reservationId   :   "6303bb3e22b4772aeea380f2" 
        }
        Return: JSON Object
    ********************************************************/
    async cancelReservation() {
        try {
            let reservationId = this.req.body.reservationId;
            let checkReservation = await Reservation.updateOne({ _id: reservationId, Status: 'active' }, { $set: { Status: 'cancelled' } })
            if (checkReservation.nModified != 0) {
                return this.res.send({ status: 1, message: "Reservation Cancelled." });
            }
            return this.res.send({ status: 0, message: "Reservation not Cancelled." });

        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: 'Something went wrong.' });
        }
    }

    /********************************************************
        Purpose     :   Guest Stay Summery
        Parameter   :   {
            reservationId   :   "6303bb3e22b4772aeea380f2" 
        }
        Return  :   JSON Object
    ********************************************************/
    async guestStaySummery() {
        try {
            let page = this.req.body.page;
            let pageSize = this.req.body.pageSize;
            let skip = (Number(page) - 1) * (Number(pageSize));
            let getData = await Reservation.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {
                    $project:
                    {
                        guestUserId: '$userId',
                        guestName: { "$arrayElemAt": ["$users.name", 0] },
                        upcomingStayInfo: {
                            numberOfUpcomingStays: "10",
                            totalNumberOfNightsInUpcomingStays: "12",
                            totalUpcomingStayAmount: "20000",
                        },
                        pastStayInfo: {
                            numberOfPastStays: "4",
                            totalNumberOfNightsInPastStays: "6",
                            totalPastStayAmount: "30000"
                        },
                        cancelledStayInfo: {
                            numberOfCancelledReservations: "1"
                        },
                        totalStaysAmount: "500000"
                    }
                },

            ])
            return this.res.send({ status: 1, message: "Summary Data.", data: getData });

        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: 'Something went wrong.' });
        }
    }

    /********************************************************
        Purpose     :   Search Stays
        Parameter   :   {
            fromDate    :
            todate      : 
        }
        Return  :   JSON Object
    ********************************************************/
    async searchStays() {
        try {
            if (!this.req.body.fromDate || !this.req.body.toDate) {
                return this.res.send({ status: 0, message: "Please send proper request parameter." })
            }
            let getData = await Reservation.find({ arrivalDate: { $gte: new Date(this.req.body.fromDate), $lte: new Date(this.req.body.toDate) } })
            return this.res.send({ status: 1, message: "Summary Data.", data: getData });

        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: 'Something went wrong.' });
        }
    }
}

module.exports = HotelController;