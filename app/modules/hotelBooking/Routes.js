
module.exports = (app, express) => {

    const router = express.Router();
    const hotelController = require('../hotelBooking/Controller');
    const config = require('../../../configs/configs');

    router.post('/addHotel', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.addHotel();
    });

    router.post('/createReservation', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.createReservation();
    });

    router.post('/allReservations', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.allReservations();
    });

    router.get('/reservationsById/:reservationId', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.reservationsById();
    });

    router.post('/cancelReservation', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.cancelReservation();
    });

    router.post('/guestStaySummery', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.guestStaySummery();
    });

    router.post('/searchStays', (req, res, next) => {
        const hObj = (new hotelController()).boot(req, res);
        return hObj.searchStays();
    });


    app.use(config.baseApiUrl, router);
}