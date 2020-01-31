export interface LoginObject {
    success: boolean;
    message: string;
    data?: {
        authToken: any;
        userData: any;
    }
}