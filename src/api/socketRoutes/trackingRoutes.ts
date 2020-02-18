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
                //  TODO: We have to clean up some data and remove the user from the tracking when being disconnected
            })
            socket.on('trackLocation', ({ lat, lng }) => {
                
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
        } else {
            socket.emit('authenticateSocket', { success: false, message: 'Authentification failed!' })
        }
    })
}
