import AsyncStorage from "@react-native-async-storage/async-storage";
import * as aesjs from "aes-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Where Supabase keeps the signed in session (access and refresh tokens) on the phone.
//
// Before: plain text in AsyncStorage, which any other app with file access (a rooted phone, a backup, malware) can
// read. Now: the session is encrypted with AES-256 and only the ciphertext goes into AsyncStorage. The key is generated
// on the phone and kept in the system keystore (iOS Keychain, Android Keystore) through expo-secure-store, which cannot
// hold values over 2 KB, hence the split: key in the keystore, data in AsyncStorage. This is the pattern Supabase
// documents for React Native ("LargeSecureStore"), with two changes: random bytes come from expo-crypto, and sessions
// saved in plain text by older versions are upgraded in place so nobody is signed out.
//
// A fresh key is made on every write (never reused with the same counter), so AES-CTR is safe here.

const PREFIX = "enc1:"; // marks encrypted values; anything else is a plain text value from an older version
const KEYCHAIN = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

// The storage uses injected pieces so it can be tested without a phone (see createSecureStorage's callers).
export function createSecureStorage({ plain, secure, randomBytes, options = KEYCHAIN }) {
  const encrypt = async (key, value) => {
    const encryptionKey = randomBytes(32);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await secure.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey), options);
    return PREFIX + aesjs.utils.hex.fromBytes(encrypted);
  };

  const decrypt = async (key, stored) => {
    const keyHex = await secure.getItemAsync(key, options);
    if (!keyHex) return null; // the key is gone (restored backup, wiped keystore): the session cannot be read
    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(keyHex), new aesjs.Counter(1));
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(stored.slice(PREFIX.length))));
  };

  const forget = async (key) => {
    await plain.removeItem(key);
    await secure.deleteItemAsync(key, options);
  };

  return {
    async getItem(key) {
      const stored = await plain.getItem(key);
      if (stored == null) return null;
      if (!stored.startsWith(PREFIX)) {
        // Saved in plain text by an older version: keep the session and encrypt it now.
        await plain.setItem(key, await encrypt(key, stored));
        return stored;
      }
      try {
        const value = await decrypt(key, stored);
        if (value == null) await forget(key);
        return value;
      } catch {
        await forget(key); // unreadable (damaged): treat as signed out rather than crash
        return null;
      }
    },
    async setItem(key, value) {
      await plain.setItem(key, await encrypt(key, value));
    },
    removeItem: forget,
  };
}

export const secureStorage = createSecureStorage({
  plain: AsyncStorage,
  secure: SecureStore,
  randomBytes: (length) => Crypto.getRandomBytes(length),
});
