import AsyncStorage from "@react-native-async-storage/async-storage";
import * as aesjs from "aes-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const PREFIX = "enc1:";
const KEYCHAIN = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

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
    if (!keyHex) return null;
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
        await plain.setItem(key, await encrypt(key, stored));
        return stored;
      }
      try {
        const value = await decrypt(key, stored);
        if (value == null) await forget(key);
        return value;
      } catch {
        await forget(key);
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
