---
title: Petri-Net Discovery with Genetic Algorithms
summary: >-
  Evolves Petri-net structures from event-log traces with a genetic algorithm,
  comparing crossover, mutation and selection operators against a combinatorial
  search space.
domain: data-optimization
stack: [Python, DEAP, pm4py, NumPy, Evolutionary Computation]
repoUrl: https://github.com/GeorgeAnes/petri-net-ga-optimization
results:
  - Baseline and decorated best-found candidates both reached alignment fitness 1.0 in the selected Task 5 run
  - Perfect replay conformance on that event log, with no structural penalties applied
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

## What a fitness of 1.0 means here

Both the baseline and decorated best-found candidates reached alignment fitness
1.0 in the selected run. That is a specific claim and worth stating precisely:
the discovered net replays the traces in that event log perfectly, and no
structural penalty was applied against it.

It is not an average across repeated runs, and it is not a claim that the
discovered model is correct in every other respect. Alignment fitness measures
replay conformance against one log. A net can replay a log perfectly and still
be more permissive than the real process, which is why the operator comparison
and the hyperparameter sweep are the more informative parts of the project.

## Data

The original full event log is not published. A small synthetic example ships
with the repository to document the expected trace format, and reproducing the
full benchmark requires the original log.
