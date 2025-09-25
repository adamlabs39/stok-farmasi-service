
const generateRandomChars = (length) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Hanya menggunakan huruf kapital
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateNoPermintaanUnit = () => {
  const prefix = "PRM";
  const randomChars = generateRandomChars(4);
  return `${prefix}${randomChars}`;
};
