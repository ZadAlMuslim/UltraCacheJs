const zlib = require('zlib');

module.exports = {
    /**
     * Compress data using gzip
     * @param {*} data - Data to compress
     * @returns {Buffer} Compressed data
     */
    compress(data) {
        try {
            const stringData = JSON.stringify(data);
            return zlib.gzipSync(stringData);
        } catch (error) {
            console.error('Compression error:', error);
            return data;
        }
    },

    /**
     * Decompress gzipped data
     * @param {Buffer} data - Compressed data
     * @returns {*} Decompressed data
     */
    decompress(data) {
        try {
            if (Buffer.isBuffer(data)) {
                const decompressed = zlib.gunzipSync(data);
                return JSON.parse(decompressed.toString());
            }
            return data;
        } catch (error) {
            console.error('Decompression error:', error);
            return data;
        }
    }
};
