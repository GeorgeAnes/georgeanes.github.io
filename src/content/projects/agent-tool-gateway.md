---
title: Agent Tool Gateway
summary: >-
  An engineering agent whose tools run on three small servers, reached through
  three designs: a shared key, a forwarded user token and a gateway with
  per-tool scopes and approvals. Fifteen executed attacks compare them,
  including one the gateway does not stop.
domain: ai-ml
stack: [Python, FastAPI, PyJWT, httpx, pytest, Playwright]
repoUrl: https://github.com/GeorgeAnes/agent-tool-gateway
featured: true
order: 3
results:
  - The shared key stopped 0 of 15 executed attacks, the forwarded token 9 and the gateway 14
  - Over 20 queries, a viewer received 19 restricted notes under the shared key and none under the other two designs
  - An engineer approving a plausible poisoned write executes under all three designs, and the matrix reports it as not protected
heroImage: ../../assets/projects/agent-tool-gateway/attack-matrix.png
heroImageAlt: >-
  Attack matrix with fifteen rows and three columns for the shared key (A), the
  forwarded token (B) and the gateway (C). The shared-key column is red in every
  row, the forwarded-token column is red in six rows, and the gateway column is
  red only in row 15, marked not protected. The bottom row, labelled held, of
  15, reads 0, 9 and 14.
figures:
  - src: ../../assets/projects/agent-tool-gateway/write-held-for-approval.png
    alt: >-
      Trace for the user ben on design C asking to set the feed rate to 8, with
      thirteen lines, the last two marked held. Below it a dashed box reads
      waiting for a human, shows the write_setpoint arguments and a hash prefix,
      and has an Approve button. The Result card reads waiting for approval,
      with the feed rate still 6.0.
    caption: >-
      A write held at the gateway until a human approves these exact arguments.
      The feed rate stays at 6.0 until then.
  - src: ../../assets/projects/agent-tool-gateway/refused-write-trace.png
    alt: >-
      Trace for the user ana on design C with twenty-one lines. Line 16, marked
      injected, quotes a write_setpoint instruction found in a tool result.
      Lines 19 and 20 are marked refused, and the gateway audit entry on line 19
      reads decision deny, reason insufficient_scope plant.write. The Result
      card reads finished, with the write failing with 403 and the feed rate at
      6.0.
    caption: >-
      The scripted planner obeys an instruction found in a tool result. The
      gateway refuses the write for lack of the plant.write scope and records the
      refusal in its audit line.
---

## Problem

An agent that calls tools can be talked into calling the wrong one, because text
it reads, such as a document, can carry instructions. The question is where the
credentials and the checks belong.

## Approach

The same requests run through three designs. In A the agent holds one shared
static key. In B the user's token is forwarded unchanged. In C a gateway
validates the token, checks one scope per tool, exchanges it for a narrow token
per server, holds writes for a human approval bound to the exact arguments, pins
tool schemas and writes an audit line.

The tools are a centrifuge d100 calculator, a plant tag reader and setpoint
writer, and a group-filtered document search. The servers speak a subset of the
Model Context Protocol, implemented without the official SDK. The issuer is a
mock, and a scripted planner obeys instructions in tool output so injection is
reproducible.

## Evaluation

Fifteen attacks were executed against each design, including a forged signature,
a token issued for another API and a poisoned report. The shared key stopped 0
of 15 attacks, the forwarded token 9 and the gateway 14; one of the 15 rows
checks that a write is attributed to a user rather than blocked. Across 20
queries, a viewer received 19 restricted notes under A and none under B or C.

Over five runs, the gateway's median cost was 1.6 to 2.2 ms per call above the
shared key, measured inside one process. The attack C does not stop is a human
approving a plausible poisoned write, and the matrix reports it as not
protected.

## Limitations

The attacks were chosen with the defenses in view, and A and B are controls
built to fail, so the matrix shows these checks stopping these attacks and
nothing more. The planner is a script, latency is in-process, retrieval is a
16-note TF-IDF toy, and there is no revocation. The protocol subset was not
checked against the specification or run with the official MCP client. The Azure
mapping is by documentation only; nothing in it was run. The built Docker image
was not started.
