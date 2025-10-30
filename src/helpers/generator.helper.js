
const generateRandomChars = (length) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

const generateRandomAlphanumeric = (length) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateNoPengeluaranUnit = () => {
  const prefix = "PGL";
  const randomChars = generateRandomAlphanumeric(4);
  return `${prefix}${randomChars}`;
};

export const generateNoReturUnit = () => {
  const prefik = "RTR";
  const ramdomChars = generateRandomAlphanumeric(4);
  return `${prefik}${ramdomChars}`;
}
