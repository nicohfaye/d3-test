export type WellLogPoint = {
  depth: number;
  gamma: number | null;
  porosity: number;
  permeability: number | null;
  resistivity: number;
  lithology: number | null;
};

const NULL_VALUE = -999.25;

function isValidValue(value: number) {
  return Number.isFinite(value) && value > NULL_VALUE + 1e-6;
}

export function parseLas(data: string): WellLogPoint[] {
  const lines = data.split(/\r?\n/);
  let inAscii = false;
  let sawSection = false;
  const points: WellLogPoint[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("~")) {
      sawSection = true;
      inAscii = trimmed.toLowerCase().startsWith("~ascii");
      continue;
    }

    if (!sawSection) {
      inAscii = true;
    }

    if (!inAscii) continue;

    const parts = trimmed.split(/\s+/).map(Number);
    if (parts.length < 6) continue;

    const [depthRaw, gammaRaw, permRaw, porosityRaw, resistivityRaw, lithRaw] =
      parts;

    if (!isValidValue(depthRaw)) continue;

    const porosity = isValidValue(porosityRaw) ? porosityRaw : null;
    const resistivity = isValidValue(resistivityRaw) ? resistivityRaw : null;

    if (porosity === null || resistivity === null || resistivity <= 0) continue;

    points.push({
      depth: depthRaw,
      gamma: isValidValue(gammaRaw) ? gammaRaw : null,
      porosity,
      permeability: isValidValue(permRaw) ? permRaw : null,
      resistivity,
      lithology: isValidValue(lithRaw) ? lithRaw : null,
    });
  }

  return points;
}
