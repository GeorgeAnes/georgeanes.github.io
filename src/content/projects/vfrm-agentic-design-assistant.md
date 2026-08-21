---
title: VFRM Agentic Design Assistant
summary: >-
  Local LangGraph agent that explores design regions for a VFRM linear
  electromagnetic actuator, combining surrogate models, NSGA-II optimization,
  feasibility checks and clustering behind human review steps.
domain: ai-ml
stack: [Python, LangGraph, NSGA-II, Surrogate Models, RAG]
repoUrl: https://github.com/GeorgeAnes/vfrm-agentic-design-assistant
featured: true
order: 2
role: TU/e course 5ARIP10, Team 1, in collaboration with ASML
heroImage: ../../assets/projects/vfrm-agentic-design-assistant/design-space.png
heroImageAlt: >-
  Four panels showing the approved search bounds: stator and rotor geometry
  lengths in millimetres, dimensionless tooth ratios, loss limits in watts, and
  the remaining KPI bounds listed with their units.
figures:
  - src: ../../assets/projects/vfrm-agentic-design-assistant/langgraph-pipeline.png
    alt: >-
      Flowchart of the agent graph, running from input parsing and retrieval
      through a feasibility gate, problem formulation, the optimizer, Pareto
      feasibility checking and clustering, to output generation and ANSYS script
      export, with human review steps between stages.
    caption: >-
      The agent graph. Infeasible inputs exit early, and review steps sit between
      stages rather than after the fact.
---

## Problem

Choosing the geometry of a VFRM linear electromagnetic actuator means trading
several objectives against each other at once: moving force, moving mass, and
the AC and DC components of power loss. Evaluating a candidate properly means
running a finite element simulation, which is far too slow to search a
seven-dimensional space directly.

## Approach

The assistant is a LangGraph agent that runs locally. It parses an engineer's
stated goal, retrieves context from a local literature set, and checks whether
the request is feasible at all before any optimization starts. Infeasible
requests exit the graph early with an explanation rather than consuming a search.

Feasible requests are turned into a formulated optimization problem, solved with
NSGA-II against trained Kriging surrogate models that stand in for the
simulation, then checked for Pareto feasibility and clustered into
representative design regions. The run ends by exporting an ANSYS sweep script
so the candidate regions can be taken back into simulation.

Two design decisions are worth drawing out. Human review steps are wired into
the graph between stages rather than bolted on at the end, so an engineer
confirms the feasibility reading, the formulated problem, and the cluster
selection as the run proceeds. And current density is deliberately held fixed at
14 A/mm² for this study: it is carried through candidate outputs and feasibility
checks, but it is not optimized and no separate surrogate is trained for it.

## Scope

The agent does not certify a final actuator design. It returns Pareto design
regions and representative cluster information for follow-up engineering
review, and the search bounds it works within are the approved ones shown above,
sourced from ANSYS sweeps.

## Attribution

This was team work for TU/e course 5ARIP10, carried out by Team 1 in
collaboration with ASML. It is not an ASML product and carries no endorsement
from ASML. The Kriging surrogate models the agent calls were supplied to the
team rather than trained as part of this work; the contribution here is the
agent, its graph, and the optimization and review workflow around those models.
