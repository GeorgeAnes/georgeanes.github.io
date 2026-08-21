---
title: Multi-Drone LTL Formation Control
summary: >-
  MATLAB simulations that pair continuous LQR tracking with temporal-logic
  specifications, covering region-based planning, formation switching and
  leader-follower flocking for a small drone fleet.
domain: control-robotics
stack: [MATLAB, LQR, Temporal Logic, Büchi Automata, Multi-Agent Systems]
repoUrl: https://github.com/GeorgeAnes/multi-drone-ltl-formation-control
heroImage: ../../assets/projects/multi-drone-ltl-formation-control/q6_swarm_traj.png
heroImageAlt: >-
  Simulated swarm trajectories for leader-follower flocking, with follower paths
  tracking the leader through the workspace.
figures:
  - src: ../../assets/projects/multi-drone-ltl-formation-control/q4_switching.png
    alt: >-
      Trajectories showing the fleet switching between formation shapes during a
      single run.
    caption: Formation switching between shapes during a run.
  - src: ../../assets/projects/multi-drone-ltl-formation-control/q3_trajectory.png
    alt: >-
      Single-drone trajectory through labelled workspace regions, satisfying the
      temporal-logic specification.
    caption: A trajectory satisfying the temporal-logic specification over labelled regions.
---

## Problem

Coordinating a fleet of drones needs two things that are usually studied
separately. Each drone has to track a continuous trajectory accurately, and the
fleet as a whole has to satisfy discrete requirements about where it goes and in
what order, of the form "visit A, then B, and never enter C".

## Approach

The continuous layer uses LQR tracking on a double-integrator drone model. The
discrete layer abstracts the workspace into labelled regions and builds a
transition system over them, then constructs Büchi and product automata so that
an LTL-style specification can be checked and turned into a plan the continuous
controller executes.

On top of that, the project implements formation controllers for square, ternary
and switching formations, and leader-follower flocking with both straight and
circular reference motion.

## Scope

Everything here is simulation. The value is in demonstrating that the discrete
planning layer and the continuous control layer compose correctly, not in
representing a hardware deployment stack. No private data is involved.
