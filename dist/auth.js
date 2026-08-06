"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHeader = void 0;
const crypto_1 = __importDefault(require("crypto"));
const preFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";
function hmac256(data, key, format) {
    var hash = crypto_1.default.createHmac('sha256', key).update(data);
    // no format = Buffer / byte array
    return hash.digest(format);
}
function getByteArray(hex) {
    var bytes = [];
    for (var i = 0; i < hex.length - 1; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    // signed 8-bit integer array (byte array)
    return Int8Array.from(bytes);
}
function generateHeader(url, method, host, id, key) {
    var data = `id=${id}&host=${host}&url=${url}&method=${method}`;
    var timestamp = (new Date().getTime()).toString();
    var nonce = crypto_1.default.randomBytes(16).toString("hex");
    // calculate signature
    var hashedNonce = hmac256(getByteArray(nonce), getByteArray(key), null);
    var hashedTimestamp = hmac256(timestamp, hashedNonce, null);
    var hashedVerStr = hmac256(verStr, hashedTimestamp, null);
    var signature = hmac256(data, hashedVerStr, 'hex');
    return `${preFix} id=${id},ts=${timestamp},nonce=${nonce},sig=${signature}`;
}
exports.generateHeader = generateHeader;
