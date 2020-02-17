export const ValidateRegister = (userData): boolean => {
    let isValid: boolean = true;

    isValid = validateEmail(userData.email) && validateNames(userData.name) && validateNames(userData.vorname) && validateNames(userData.username);

    return isValid;
}


const validateEmail = (email: string): boolean => {
    return email.length > 5 && email.indexOf('@') !== -1;
}

const validateNames = (name: string) => {
    return name.length >= 3;
}