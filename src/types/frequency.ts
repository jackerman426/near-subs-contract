export enum Frequency {
  Hourly,
  Daily,
  Weekly,
  Monthly,
  Yearly,
}

export function isValidFrequency(frequency: any): boolean {
  const values = Object.values(Frequency).filter((v) => typeof v === "number") // Get enum numeric values
  return values.includes(frequency)
}
