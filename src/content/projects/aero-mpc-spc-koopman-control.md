---
title: AERO Predictive Control Benchmark
summary: >-
  MATLAB benchmark putting linear MPC, iterative nonlinear MPC, subspace
  predictive control and Koopman-lifted SPC on the same pitch and yaw tracking
  problem under one evaluation workflow.
domain: control-robotics
stack: [MATLAB, YALMIP, MPT3, Koopman Operator, Subspace Methods]
repoUrl: https://github.com/GeorgeAnes/aero-mpc-spc-koopman-control
results:
  - Linear MPC tracked best overall, pitch RMSE 0.1756 and yaw RMSE 0.8767
  - Improved iterative nonlinear MPC followed at 0.1955 and 0.9340
  - Koopman-lifted SPC improved yaw over baseline SPC, 1.1385 against 1.1702
heroImage: ../../assets/projects/aero-mpc-spc-koopman-control/Task4_final_comparison.png
heroImageAlt: >-
  Comparison plot of pitch and yaw tracking responses for the controllers in the
  benchmark, shown against the reference trajectory.
figures:
  - src: ../../assets/projects/aero-mpc-spc-koopman-control/Task4_KoopmanSPC_Final_outputs.png
    alt: >-
      Pitch and yaw output traces for the Koopman-lifted subspace predictive
      controller tracking the reference.
    caption: Koopman-lifted SPC outputs against the reference trajectory.
  - src: ../../assets/projects/aero-mpc-spc-koopman-control/Task1_outputs_inputs.png
    alt: >-
      Output and control input traces for the linear MPC case, showing tracking
      response alongside the commanded inputs.
    caption: Linear MPC outputs and control inputs, with terminal set certification.
---

## Problem

The AERO system couples pitch and yaw, so a controller cannot treat the two axes
independently. The question the benchmark asks is narrow and useful: given the
same plant, the same reference and the same evaluation, how do model-based and
data-driven predictive controllers actually compare?

## Approach

Five controllers were built and run through one workflow. Linear MPC with
terminal set certification provides the model-based reference point. A baseline
MPC and an improved iterative MPC handle the nonlinear plant. Subspace
predictive control derives its predictor from Hankel matrices of input and
output data rather than a model, and Koopman-lifted SPC extends that predictor
with a lifted basis and ridge regularisation.

The solver stack is YALMIP with `quadprog` and MPT3.

## What the benchmark actually showed

The data-driven controllers did not beat the model-based ones. Linear MPC
recorded the best tracking of the five, and the improved iterative MPC came
next. Koopman lifting bought a modest yaw improvement over the subspace baseline
it extends, but did not close the gap to MPC.

That is a useful result rather than a disappointing one. When a good model is
available and the terminal set can be certified, the model is hard to beat, and
the case for a data-driven predictor rests on situations where that model is not
available. Reporting it the other way round would misrepresent the comparison.

## Data

The original `.mat` datasets and model matrices are course-provided and are not
redistributed. The code is published for review; a full run needs those local
files.
