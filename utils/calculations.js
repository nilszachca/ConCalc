export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function concreteSlab(lengthFt, widthFt, thicknessIn, wastePct = 10) {
  const volumeFt3 = toNumber(lengthFt) * toNumber(widthFt) * (toNumber(thicknessIn) / 12);
  const volumeYd3 = volumeFt3 / 27;
  const total = volumeYd3 * (1 + toNumber(wastePct) / 100);

  return {
    name: "Concrete",
    quantity: Number(total.toFixed(2)),
    unit: "cubic yards",
  };
}

export function drywall(roomLengthFt, roomWidthFt, wallHeightFt, sheetWFt = 4, sheetHFt = 8, wastePct = 12) {
  const wallArea = 2 * (toNumber(roomLengthFt) + toNumber(roomWidthFt)) * toNumber(wallHeightFt);
  const sheetArea = toNumber(sheetWFt) * toNumber(sheetHFt);
  const sheets = sheetArea > 0 ? wallArea / sheetArea : 0;
  const total = sheets * (1 + toNumber(wastePct) / 100);

  return {
    name: "Drywall",
    quantity: Math.round(total + 0.5),
    unit: "sheets",
  };
}

export function flooring(lengthFt, widthFt, wastePct = 8) {
  const area = toNumber(lengthFt) * toNumber(widthFt);
  const total = area * (1 + toNumber(wastePct) / 100);

  return {
    name: "Flooring",
    quantity: Number(total.toFixed(2)),
    unit: "square feet",
  };
}

export function framingStuds(wallLengthFt, wallHeightFt, spacingIn = 16, includePlates = true) {
  const spacing = toNumber(spacingIn) || 16;
  const studCount = Math.floor((toNumber(wallLengthFt) * 12) / spacing) + 1;
  const studs = studCount + 2;

  const results = [
    {
      name: "Studs",
      quantity: studs,
      unit: `pieces @ ${Math.trunc(toNumber(wallHeightFt))}ft`,
    },
  ];

  if (includePlates) {
    const plateLength = toNumber(wallLengthFt) * 3;
    results.push({
      name: "Top/Bottom plates",
      quantity: Number(plateLength.toFixed(1)),
      unit: "linear feet",
    });
  }

  return results;
}
