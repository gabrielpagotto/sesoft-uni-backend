import * as bcrypt from 'bcrypt';

const SALTS = 10;

export const encriptPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALTS);
};

export const verifyPassword = async (
    password: string,
    encryptedPassword: string,
): Promise<boolean> => {
    return await bcrypt.compare(password, encryptedPassword);
};
