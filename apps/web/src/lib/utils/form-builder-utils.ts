// Helper function to generate snake_case key from title
export const generateKey = (title: string, existingKeys: string[]): string => {
  const words = title.trim().toLowerCase().split(/\s+/).slice(0, 3);
  const baseKey = words.join("_").replace(/[^a-z0-9_]/g, "");

  // Ensure uniqueness
  let key = baseKey;
  let counter = 1;
  while (existingKeys.includes(key)) {
    key = `${baseKey}_${counter}`;
    counter++;
  }

  return key;
};
