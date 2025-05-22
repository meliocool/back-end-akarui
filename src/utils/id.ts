import { customAlphabet } from "nanoid";

export const getId = (): string => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"); // first parameter -> semua karakter yg pengen dimasukin
  return nanoid(5); // 5 Chars
};
