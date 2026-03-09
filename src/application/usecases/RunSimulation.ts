import { MonteCarloSimulator, SimulationConfig } from '../../domain/engine/MonteCarloSimulator';
import { SimulationResult as SharedSimResult } from '../../shared/types/ipc';
import { GAME_CONSTANTS } from '../../domain/constants/GameConstants';

export class RunSimulation {
  private simulator = new MonteCarloSimulator();

  execute(config: SimulationConfig, iterations?: number): SharedSimResult {
    const result = this.simulator.simulate({
      ...config,
      iterations: iterations ?? GAME_CONSTANTS.MONTE_CARLO_DEFAULT_ITERATIONS,
    });

    return {
      iterations: result.iterations,
      successRate: result.successRate,
      averageCost: result.averageCost,
      averageAttempts: result.averageAttempts,
      percentiles: result.percentiles,
      costPercentiles: result.costPercentiles,
    };
  }
}
