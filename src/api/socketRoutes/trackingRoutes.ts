import { Socket } from 'socket.io';
import TrackingController from './../controllers/TrackingController';
import mongoDB from './../controllers/MongoDBConnection'; 

const trackingController = new TrackingController();

export default (socket: Socket) => {
    socket.on('authenticateSocket', async (authToken: any) => {
        const authentification = await mongoDB.authenticate(authToken.username, authToken.email, null, authToken.id);

        if (authentification.success) {
            const userId = authentification.data.userData.id;
            const userData = authentification.data.userData;
            let coordinates, cellKeyPath, trackingArray, savedCountryName, trackingRange;

            socket.emit('authenticateSocket', { success: true, message: 'Success!' })

            socket.on('disconnect', () => {
                if (cellKeyPath && userId && savedCountryName) {
                    trackingController.deleteCoordinates(cellKeyPath, savedCountryName, userId);
                }

                cellKeyPath = undefined;
                coordinates = undefined;
                trackingArray = undefined;
                savedCountryName = undefined;

                socket.removeAllListeners();

                socket = undefined;

                mongoDB.updateOnlineStatus(userId, false);
            })

            // Start the tracking process for the user coordinates and send the positions of the surrounding cells
            socket.on('trackLocation', ({ lat, lng, jumpCell, range }) => {
                if (jumpCell) {
                    trackingController.deleteCoordinates(cellKeyPath, savedCountryName, userId);
                    cellKeyPath = undefined;
                    coordinates = undefined;
                    trackingArray = undefined;
                }

                let gpsKeyFinal
                if (!coordinates || !cellKeyPath) {
                    const trackingResponse = trackingController.trackCoordinates({ lat, lng }, userId, userData);
                    const { coordinatesResponse, cellKeyPathResponse, countryName, gpsKey } = trackingResponse;

                    if(gpsKey) {
                        gpsKeyFinal = gpsKey;
                    }
                    
                    if((trackingResponse as any) === 'Error') {
                        return;
                    }
                    
                    
                    coordinates = coordinatesResponse;
                    cellKeyPath = cellKeyPathResponse;
                    savedCountryName = countryName;

                    mongoDB.updateOnlineStatus(userId, true);

                } else {
                    coordinates.lat = lat;
                    coordinates.lng = lng;
                }

                if (!trackingArray || range !== trackingRange) {
                    trackingRange = range;
                    trackingArray = trackingController.extractTrackingArray(cellKeyPath, savedCountryName, trackingRange);
                }

                socket.emit('trackLocationArray', { trackingArray, gpsKey: gpsKeyFinal });
            })

            // When stopping the tracking process, delete the coordinates from the grid and unset the vairables
            socket.on('stopTracking', () => {
                if (cellKeyPath && userId && savedCountryName) {
                    trackingController.deleteCoordinates(cellKeyPath, savedCountryName, userId);
                }

                cellKeyPath = undefined;
                coordinates = undefined;
                trackingArray = undefined;
                savedCountryName = undefined;

                mongoDB.updateOnlineStatus(userId, false);
            })
        } else {
            socket.emit('authenticateSocket', { success: false, message: 'Authentification failed!' })
        }
    })
}
