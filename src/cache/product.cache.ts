import myCatch from "./cache";

const flushProductsList = () => {
  const keys = myCatch.keys();

  const productKeys = keys.filter((key) => key.startsWith("products:"));
  if (productKeys.length > 0) {
    myCatch.del(productKeys);
  }
};

export default flushProductsList;
