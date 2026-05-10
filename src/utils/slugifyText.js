import slugify from "slugify";

export function slugifyText(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}