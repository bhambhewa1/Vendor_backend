const crypto = require("crypto");
const algorithm = "aes-256-cbc"; // Using AES encryption

// A better practice is to use a key that's derived from a password.
// You can use a library like 'bcrypt' or 'pbkdf2' to create a more secure key.
// Fixed key and IV values (for testing only)
const key = Buffer.from("01234567890123456789012345678901"); // 32 bytes (256 bits)
const iv = Buffer.from("0123456789012345"); // 16 bytes (128 bits)


// Encrypting text
const EncryptedData = (id) => {
  try {
    const text = id.toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Calculate expiration time of 1 hour in milliseconds(60*60*1000)

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text + "|" + expiresAt, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    return encrypted;
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

// Decrypting text
const DecryptedData = (text) => {
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    const [decyptText, expiresAt] = decrypted.split("|"); // Split plaintext and expiration time
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      return {
        code: 401,
        reason: "ID is expired.",
      };
    } else {
      return decyptText;
    }
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};

module.exports = { EncryptedData, DecryptedData };
