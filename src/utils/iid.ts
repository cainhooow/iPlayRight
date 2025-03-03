export function generatePlaylistId(): string {
  try {
    const date = new Date();
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date generated");
    }

    const dateString = Date.now().toString(36);

    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);

    const randomText = Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 5);

    return `ipl-${dateString}-${randomText}`;
  } catch (error) {
    console.error("Error generating playlist ID:", error);
    // Fallback to a simpler ID format if something goes wrong
    return `ipl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
}

export function generateUserAccessKey(): string {
  const date = new Date();
  const timestamp = date.getTime().toString(36);

  // Generate cryptographically secure random values
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  const randomName = Array.from(randomBytes.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(2, 12);

  const randomString = Array.from(randomBytes.slice(8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(2, 20);

  return `${timestamp}:${randomName}:${randomString}`;
}

// Add this fallback function
function simpleHash(text: string, salt: string): string {
  const textToChars = (text: string) =>
    text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
  const applySalt = (code: number[]) =>
    textToChars(salt).reduce(
      (a, b) => a ^ b,
      code.reduce((a, b) => a ^ b)
    );

  console.log(applySalt);

  return textToChars(text)
    .map((x) => byteHex(x))
    .join("");
}

export async function hashText(
  password: string,
  userAccessKey: string
): Promise<string> {
  if (!userAccessKey || !password) {
    throw new Error("Invalid password or access key");
  }

  const [timestamp, name, key] = userAccessKey.split(":");
  if (!timestamp || !name || !key) {
    throw new Error("Invalid access key format");
  }

  // Try Web Crypto API first
  try {
    if (crypto.subtle) {
      // Create encryption key from userAccessKey
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const encryptionKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: encoder.encode(timestamp),
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // Encrypt
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        encryptionKey,
        encoder.encode(password)
      );

      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(encrypted);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);

      return Array.from(combined)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } else {
      throw new Error("Web Crypto API not available");
    }
  } catch (error) {
    console.warn("Using fallback encryption method due to:", error);
    // Use fallback method
    return simpleHash(password, key + timestamp);
  }
}

// Add this fallback function for decryption
function simpleUnhash(hashedText: string, salt: string): string {
  console.log(salt);
  const textToChars = (text: string) =>
    text.split("").map((c) => c.charCodeAt(0));
  console.log(textToChars);
  const hexToBytes = (hex: string) => {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  };

  const bytes = hexToBytes(hashedText);
  return String.fromCharCode(...bytes);
}

export async function unhashText(
  hashedPassword: string,
  userAccessKey: string
): Promise<string> {
  if (!userAccessKey || !hashedPassword) {
    throw new Error("Invalid encrypted password or access key");
  }

  const [timestamp, name, key] = userAccessKey.split(":");
  if (!timestamp || !name || !key) {
    throw new Error("Invalid access key format");
  }

  try {
    if (crypto.subtle) {
      // Convert hex string back to Uint8Array
      const combined = new Uint8Array(
        hashedPassword.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);

      // Recreate encryption key
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const encryptionKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: encoder.encode(timestamp),
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        encryptionKey,
        encryptedData
      );

      return new TextDecoder().decode(decrypted);
    } else {
      throw new Error("Web Crypto API not available");
    }
  } catch (error) {
    console.warn("Using fallback decryption method due to:", error);
    // Use fallback method
    return simpleUnhash(hashedPassword, key + timestamp);
  }
}
