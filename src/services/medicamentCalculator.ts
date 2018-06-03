export default class MedicamentCalculator {

  constructor() {
    if (MedicamentCalculator._instance)
      throw new Error("Instantiation failed: Use MedicamentCalculator.getInstance() instead of new keyword.");

    MedicamentCalculator._instance = this;
  }

  calculatePosology(pharmaceuticForm: any, selectedConcentration: any, age: number, weight: number): any {
    let posology = {
      dose: 0,
      periodicity: ""
    }

    if (age <= 0)
      return null;

    switch (pharmaceuticForm.index) {
      case 1: //Gotas
        posology.dose = Math.trunc(weight);
        break
      case 2: //Suspensão
        posology.dose = (((Math.trunc(weight) * selectedConcentration.dailyDoseWeight) * selectedConcentration.dose) / selectedConcentration.doseComposition) / selectedConcentration.dosesPerDay;
        break
      case 3: //Cápsulas
      case 4: //Comprimidos
      case 5: //Pílulas
      case 6: //Drágeas
        posology.dose = selectedConcentration.dose;
        break
      default:
        return null;
    }

    posology.periodicity = this.calculatePeriodicity(selectedConcentration.dosesPerDay);

    return posology;
  }

  private calculatePeriodicity(dosesPerDay): string {
    let temporalUnit = "";
    let periodicity = 0;

    // if (dosesPerDay <= 24) {
      temporalUnit = dosesPerDay == 24 ? "hora" : "horas";
      periodicity = 24 / dosesPerDay;
    // } else {
    //   temporalUnit = dosesPerDay == 1440 ? "minuto" : "minutos";
    //   periodicity = 1440 / dosesPerDay;
    // }

    return `A cada ${periodicity} ${temporalUnit}`;
  }

  /* Singleton features */
  private static _instance: MedicamentCalculator = new MedicamentCalculator();
  public static getInstance(): MedicamentCalculator { return MedicamentCalculator._instance; }
}
