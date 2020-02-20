export const ValidateImageFile = (file): boolean => {

    let isValid: boolean = true;

    isValid = validateImage(file);

    return isValid;
};


const validateImage = (File: Buffer): boolean => {
    return true;
};
