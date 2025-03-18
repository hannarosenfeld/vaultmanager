export const sortWarehouseFields = (fields) => {
  let sortedFields = [];
  if (fields) {
    let fieldsArr = Object.values(fields);

    sortedFields = fieldsArr.sort(function (a, b) {
      // Split the field names into alphabetical and numeric parts
      const [, aAlpha, aNum] = a.name.match(/^([A-Za-z]+)(\d+)$/);
      const [, bAlpha, bNum] = b.name.match(/^([A-Za-z]+)(\d+)$/);

      // Compare alphabetical parts first
      if (aAlpha !== bAlpha) {
        return aAlpha.localeCompare(bAlpha);
      }

      // If alphabetical parts are equal, compare numeric parts as numbers
      return parseInt(aNum) - parseInt(bNum);
    });
  }

  return sortedFields;
};