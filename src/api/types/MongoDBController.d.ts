export interface AuthTokenStore {
    [key:string] : {
        id: string;
        validity: number;
        selfDestructHandler?: number; 
        username: string;
        email: string;
    }
}