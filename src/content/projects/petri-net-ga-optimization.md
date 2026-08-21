---
title: Petri-Net Discovery with Genetic Algorithms
summary: >-
  Evolves Petri-net structures from event-log traces with a genetic algorithm,
  comparing crossover, mutation and selection operators against a combinatorial
  search space.
domain: data-optimization
stack: [Python, DEAP, pm4py, NumPy, Evolutionary Computation]
repoUrl: https://github.com/GeorgeAnes/petri-net-ga-optimization
# CONFIRM: the reported fitness of 1.0 for both decorated and baseline variants
# comes from the README's selected run summary. George to confirm before launch,
# including whether that run is representative or a best case.
results:
  - Decorated and baseline variants both reached a reported fitness of 1.0 in the selected run
heroImage: ../../assets/projects/petri-net-ga-optimization/task1_best_fitness.png
heroImageAlt: >-
  Convergence curve of best fitness against generation for the baseline genetic
  algorithm run.
figures:
  - src: ../../assets/projects/petri-net-ga-optimization/task2_operator_boxplot.png
    alt: >-
      Box plot comparing final fitness across crossover, mutation and tournament
      operator settings.
    caption: Operator comparison across crossover, mutation and tournament settings.
  - src: ../../assets/projects/petri-net-ga-optimization/task3_hyperparameter_heatmap.png
    alt: >-
      Heatmap of outcome against two hyperparameters, showing which combinations
      perform best.
    caption: Hyperparameter sweep over the genetic algorithm settings.
---

## Problem

Process mining can express a workflow as a Petri net, but the space of candidate
net structures grows combinatorially with the number of activities, so it cannot
be enumerated directly.

## Approach

Candidate nets are encoded as integer chromosomes over the arcs, and evolved
with a DEAP-based genetic algorithm whose fitness is evaluated against the
behaviour recorded in the event log.

Beyond the baseline run, the project compares operator choices across crossover,
mutation and tournament settings and sweeps the hyperparameters, so the output is
a comparison of search strategies rather than a single tuned result.

## Data

The original full event log is not published. A small synthetic example ships
with the repository to document the expected trace format, and reproducing the
full benchmark requires the original log.
