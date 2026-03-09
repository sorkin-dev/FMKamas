export interface SinkState {
  value: number;
  maxPossible: number;
  percentage: number;
  lastUpdated: Date;
}

export interface SinkCalculation {
  before: number;
  after: number;
  delta: number;
  consumed: number;
}
