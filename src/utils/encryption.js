const crypto = require('crypto');

const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV_LENGTH = 16;

module.exports = {
    /**
     * Encrypt data using AES-256-CBC
     * @param {*} data - Data to encrypt
     * @returns {string} Encrypted data
     */
    encrypt(data) {
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
            const encrypted = cipher.update(JSON.stringify(data));
            const finalBuffer = Buffer.concat([encrypted, cipher.final()]);
            return Buffer.concat([iv, finalBuffer]).toString('base64');
        } catch (error) {
            console.error('Encryption error:', error);
            return data;
        }
    },

    /**
     * Decrypt AES-256-CBC encrypted data
     * @param {string} data - Encrypted data
     * @returns {*} Decrypted data
     */
    decrypt(data) {
        try {
            const buffer = Buffer.from(data, 'base64');
            const iv = buffer.slice(0, IV_LENGTH);
            const encryptedData = buffer.slice(IV_LENGTH);
            const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
            const decrypted = decipher.update(encryptedData);
            const finalBuffer = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(finalBuffer.toString());
        } catch (error) {
            console.error('Decryption error:', error);
            return data;
        }
    }
};
