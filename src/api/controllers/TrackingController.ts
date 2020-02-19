import { Socket } from 'socket.io';
import squareGrid from '@turf/square-grid';
import { BBox, FeatureCollection, Polygon } from '@turf/helpers';
import { getBounds, isPointInPolygon } from 'geolib';
import { Coordinates } from './../types/Tracking';
const countryDataObject: any = {};
const countrySearch = require('country-reverse-geocoding').country_reverse_geocoding(null, countryDataObject);

class TrackingController {
    private countries = {};

    constructor() {
    }

    /**
     * Start the tracking of the given user Position
     * @param coordinates an object with lat/lng coordinates
     * @param id the user ID
     * @param userData the user data
     * @returns The saved coordinates object, the path to the cell and the countryName
     */
    public trackCoordinates({ lat, lng }: Coordinates, id: number, userData: any): { coordinatesResponse: Coordinates, cellKeyPathResponse: string, countryName: string } {
        let coordinates: Coordinates = { lat, lng };
        const countryName: string = countrySearch.get_country(lat, lng).name;
  
        if (this.countries[countryName] === 'processing') {
            return;
        }

        let trackingData;

        if (this.countries[countryName]) {
            trackingData = this.addToTracking(coordinates, id, countryName, userData);
        } else {
            this.createGridForCountry(countryName); // TODO: Error handling if country does not exist in our Geo data
            trackingData = this.addToTracking(coordinates, id, countryName, userData);
        }

        return { coordinatesResponse: trackingData.coordinates, cellKeyPathResponse: trackingData.cellKeyPath, countryName };
    }

    /**
     * Get the tracking array of cell objects for the given range and start cell
     * @param cellKeyPath 
     * @param countryName 
     * @param range 
     */
    public extractTrackingArray(cellKeyPath: string, countryName: string, range: number = 3) {
        const trackingArray = [];

        const { grid, columnIndex, rowIndex } = this.getGridAndRowByPath(cellKeyPath, countryName);


        // TODO: We need to enale to app to allow for tracking of users in different major cells
        for(let index = 0; index <= range; index++) {
            const rowUpper = rowIndex+index < grid.data.length ? grid.data[rowIndex+index] : undefined;
            const rowLower = rowIndex-index >= 0 ? grid.data[rowIndex-index] : undefined;

            if(rowUpper) {
                for(let index = 0; index <= range; index++) {
                    const columnUpper = columnIndex+index < rowUpper.length ? rowUpper[columnIndex+index] : undefined;
                    const columnLower = columnIndex-index >= 0 ? rowUpper[columnIndex-index] : undefined;
    
                    if(columnUpper) {
                        trackingArray.push(columnUpper.data);
                    }
    
                    if(index !== 0 && columnLower) {
                        trackingArray.push(columnLower.data);
                    }
                }
            } 

            if(index !== 0 && rowLower) {
                for(let index = 0; index <= range; index++) {
                    const columnUpper = columnIndex+index < rowLower.length ? rowLower[columnIndex+index] : undefined;
                    const columnLower = columnIndex-index >= 0 ? rowLower[columnIndex-index] : undefined;
    
                    if(columnUpper) {
                        trackingArray.push(columnUpper.data);
                    }
    
                    if(index !== 0 && columnLower) {
                        trackingArray.push(columnLower.data);
                    }
                }
            }
        }

        return trackingArray;
    }

    /**
     * Delete the coordinates of a user from the grid
     * @param path 
     * @param countryName 
     * @param userID 
     */
    public deleteCoordinates(path: string, countryName: string, userID: number) {
        const pathArray: string[] = path.split(':::');

        const columnCell = this.getEntryByPath(pathArray, countryName);
        if (columnCell[userID]) {
            delete columnCell[userID];
        }
    }

    private getGridAndRowByPath(cellKeyPath: string, countryName: string) {
        const pathArray: string[] = cellKeyPath.split(':::');
        const columnIndex: number = parseInt(pathArray.pop());
        const rowIndex: number = parseInt(pathArray.pop());


        const grid = this.getEntryByPath(pathArray, countryName);

        return { grid, columnIndex, rowIndex };
    }

    // Returns the grid object for a given path
    private getEntryByPath(pathArray: string[], countryName: string) {
        let tempObject = this.countries[countryName];

        for (let path of pathArray) {
            if (typeof tempObject === 'object' && !Array.isArray(tempObject)) {
                tempObject = tempObject.data;
            }

            tempObject = tempObject[parseInt(path)];
        }

        return tempObject;
    }

    // Add a coordinate to the tracking array
    private addToTracking(coordinates: Coordinates, id: number, countryName: string, userData: any) {
        const countryGrid = this.countries[countryName];
        const { lat, lng } = coordinates;

        const geoLibCoordinates = { latitude: lat, longitude: lng };


        let tempGrid;
        let cellKeyPath: string[] = []; // The cell key path is ued to find the entry without searching for it through the whole tracking array
        // Save 250x250 cell in tempGrid
       
        while(tempGrid === undefined || (tempGrid === undefined || typeof tempGrid === 'object') && Array.isArray(tempGrid)) {
            const isInGridResponse = this.checkIfInGrid(tempGrid ||countryGrid, geoLibCoordinates);
            if (isInGridResponse) {
                const { pathArray, returnGrid } = isInGridResponse;
                tempGrid = returnGrid;
                cellKeyPath = [ ...cellKeyPath, ...pathArray];
            } else {
                tempGrid = false;
            }
        }



        if (!tempGrid) {
            return 'Error';
        } else if (tempGrid[id]) {
            return { coordinates: tempGrid[id], cellKeyPath: cellKeyPath.join(':::') };
        } else {
            coordinates.userData = userData;
            tempGrid[id] = coordinates;
            return { coordinates, cellKeyPath: cellKeyPath.join(':::') };
        }
    }

    // Checks if a certain coordinate is in the boundries of a given coordinate string
    private isKeyInBounds(coordinates, key): boolean {
        const bounds = JSON.parse(key);

        return isPointInPolygon(coordinates, bounds);
    }

    // Recursive check to get the column cell which fits to the given user coordinates
    private checkIfInGrid(grid, coordinates) {
        const tempRow: (string | number)[] = [];

        for (let index = 0; index < grid.length; index++) {
            if(typeof grid[index] === 'object' && Array.isArray(grid[index])) {
                const isInGridResponse = this.checkIfInGrid(grid[index], coordinates);

                if (isInGridResponse) {
                    const { pathArray, returnGrid } = isInGridResponse;

                    return { pathArray: [ index, ...pathArray ], returnGrid };
                }
            } else if (typeof grid[index] === 'object') {
                const { key, data } = grid[index];

                if (this.isKeyInBounds(coordinates, key)) {
                    tempRow[0] = index;
                    return { pathArray: tempRow, returnGrid: data };
                }
            }
        }

        return false;
    }

    // TODO: Loopstack of doom? We can solve this iterative, so we should
    // Creates a grid from a country name with 250x250 km cells in the first layer, 50x50 in the second, 25x25 in the third and 1x1 in the final layer
    private createGridForCountry(countryName: string) {
        const boundries = this.getCountryDataBounds(countryName);
        this.countries[countryName] = 'processing';
        const grid = this.grid(boundries, 250);
        const countryGrid = this.reduceGrid(grid);
        const gridLayers = [ 50, 25, 2 ];


        this.countries[countryName] = this.createGridLayers(gridLayers, countryGrid);
    }

    // Recursive function to create the serveral grid layers from an given array of layers
    private createGridLayers(layersArray: number[], grid) {
        layersArray = [...layersArray]; // Create a copy

        if(layersArray.length > 0) {
            const layer = layersArray.shift();

            for (let row of grid) {
                for (let column of row) {
                    const newLayersArray = [...layersArray]; // Create a copy
                    const key = column.key;
                    const newGridBounds = getBounds(JSON.parse(key));
                    const newGrid = this.grid(newGridBounds, layer);
                    const finalNewGrid = this.reduceGrid(newGrid);

                    column.data = this.createGridLayers(newLayersArray, finalNewGrid);
                }
            }
        } else {
            for (let row of grid) {
                for (let column of row) {
                    column.data = {};
                }
            }
        }

        return grid;
    } 

    // Creat a turf grid based on boundries and cell size in KM
    private grid(boundries, size): FeatureCollection<Polygon> {
        if (!Array.isArray(boundries)) {
            boundries = this.boundsObjectToArray(boundries);
        }

        const grid = squareGrid((boundries as BBox), size);

        return grid;
    }

    // Map a turf grid wo an key: value object with the joined gps coordinates as the key;
    private reduceGrid(grid: FeatureCollection<Polygon>, test?:boolean) {
        const reducedGrid = [];
        const tempGrid = {};

        grid.features.forEach(cell => {
            const cellObject: any = {};

            const coordinates = cell.geometry.coordinates[0];
            const coordinatesFinal = coordinates.map((point)  => {
                return { latitude: point[0], longitude: point[1] }
            });

            const tempKey = coordinatesFinal[0].longitude;

            const key = JSON.stringify(coordinatesFinal);
            cellObject.key = key;
            cellObject.data = {}; 

            if(tempGrid[tempKey]) {
                tempGrid[tempKey].push(cellObject);
            } else {
                tempGrid[tempKey] = [ cellObject ];
            }
        })

        Object.keys(tempGrid).sort().forEach( rowKey => {
            reducedGrid.push(tempGrid[rowKey]);
        } )

        return reducedGrid;
    }
  
    // Function to get the GPS boundries of an country
    private getCountryDataBounds(countryName: string) {
        const countryData = countryDataObject.country_data.find((country) => {
            return country.properties.name === countryName;
        })

        const countryPolygon = countryData.geometry.coordinates;

        const finalPolygon = countryPolygon[0] // TODO: Support multipolygon

        // For the country bounds we have to swap these values. Not sure why
        const countryPolygonObject = finalPolygon.map((point) => {
            return { latitude: point[1], longitude: point[0] } 
        })

        return getBounds(countryPolygonObject);
    }

    // Map the output of geolib to an array which can be used by torf square grid
    private boundsObjectToArray(bounds) {
        return [bounds.minLat, bounds.minLng, bounds.maxLat, bounds.maxLng];
    }
  }
  
  export default TrackingController;
