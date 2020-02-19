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
            let coordinates, cellKeyPath, trackingArray, savedCountryName;

            socket.emit('authenticateSocket', { success: true, message: 'Success!' })

            socket.on('disconnect', () => {
                if (cellKeyPath && userId && savedCountryName) {
                    trackingController.deleteCoordinates(cellKeyPath, savedCountryName, userId);
                }

                cellKeyPath = undefined;
                coordinates = undefined;
                trackingArray = undefined;
                savedCountryName = undefined;

            })
            socket.on('trackLocation', ({ lat, lng, jumpCell }) => {
                if (jumpCell) {
                    trackingController.deleteCoordinates(cellKeyPath, savedCountryName, userId);
                    cellKeyPath = undefined;
                    coordinates = undefined;
                    trackingArray = undefined;
                }

                if (!coordinates || !cellKeyPath) {
                    const trackingResponse = trackingController.trackCoordinates({ lat, lng }, userId, userData);
                    const { coordinatesResponse, cellKeyPathResponse, countryName } = trackingResponse;
                    
                    if((trackingResponse as any) === 'Error') {
                        return;
                    }
                    
                    
                    coordinates = coordinatesResponse;
                    cellKeyPath = cellKeyPathResponse;
                    savedCountryName = countryName;

                } else {
                    coordinates.lat = lat;
                    coordinates.lng = lng;
                }

                if (!trackingArray) {
                    trackingArray = trackingController.extractTrackingArray(cellKeyPath, savedCountryName);
                }

                socket.emit('trackLocationArray', trackingArray);
            })
            socket.on('stopTracking', () => {
                if (cellKeyPath && userId && savedCountryName) {
                    trackingController.deleteCoordinates(cellKeyPath, savedCountryName, userId);
                }

                cellKeyPath = undefined;
                coordinates = undefined;
                trackingArray = undefined;
                savedCountryName = undefined;
            })
        } else {
            socket.emit('authenticateSocket', { success: false, message: 'Authentification failed!' })
        }
    })
}
