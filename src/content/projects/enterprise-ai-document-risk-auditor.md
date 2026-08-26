---
title: Enterprise AI Document Risk Auditor
summary: >-
  Local FastAPI and React tool that extracts factual claims from a business
  document, retrieves supporting passages, and scores how well each claim is
  grounded in evidence before a human signs it off.
domain: ai-ml
stack: [Python, FastAPI, React, TF-IDF Retrieval, Local LLM, Azure, Terraform, Docker]
repoUrl: https://github.com/GeorgeAnes/enterprise-ai-document-risk-auditor
liveUrl: https://kind-beach-04e83b00f.7.azurestaticapps.net
liveNote: >-
  The backend scales to zero when idle, so the first request takes ~20s while a
  container starts. After that it is under 300ms.
featured: true
order: 1
heroImage: ../../assets/projects/enterprise-ai-document-risk-auditor/screenshot-dashboard.png
heroImageAlt: >-
  The auditor's review dashboard running on the live Azure deployment, showing a
  risk posture dial reading 79 of 100, a breakdown of thirteen extracted claims
  by support category, and a ranked list of the highest-risk claims with their
  labels. The figures shown come from a synthetic sample document.
---

## Problem

Enterprise AI systems increasingly draft the policies, reports and
recommendations that people then act on. Fluency is not the risk. The risk is
whether the load-bearing claims in a document are actually supported by
evidence, scoped correctly, and safe for a reviewer to approve.

Reading a generated report end to end and checking every assertion by hand does
not scale, and the reviewer has no systematic way to see which claims deserve
their attention first.

## Approach

The tool ingests a document, chunks it, extracts the sentences that read as
factual claims, and retrieves supporting passages using TF-IDF over the document
itself or an optional evidence pack. Each claim is then labelled as supported,
weakly supported, unsupported, vague or non-verifiable, or needing human review,
and carries a transparent risk score, the evidence snippets behind it, and a
review checklist. Audits export as Markdown or JSON.

The design decision that matters is the split between the two layers. The
deterministic pipeline is the auditable baseline: ingestion, chunking, claim
extraction, retrieval, scoring, labelling and export are all reproducible and
require no language model at all. A local Gemma reviewer, served through LM
Studio, is an optional interpretive layer on top; it annotates the highest-risk
claims with notes, safer rewrites and missing-evidence questions.

The reviewer never decides the score, the label, or the retrieved evidence, and
the audit completes whether or not it is running. That ordering is deliberate:
a governance tool whose output changes depending on whether a model was
available would not be auditable.

## Deployment

The tool runs on Azure, with every resource defined in Terraform and nothing
clicked into existence in the Portal. The React frontend is served from Static
Web Apps, the FastAPI backend runs on Container Apps behind a system-assigned
managed identity, sample documents live in Blob Storage, and Terraform state is
held remotely so the stack is not tied to one laptop.

The constraint that shaped the design was cost: it had to sit idle at
effectively nothing. The backend therefore runs at zero minimum replicas, the
container image is pulled from a public GitHub Container Registry package
rather than a paid Azure registry, and log ingestion is capped so a chatty
container stops rather than bills. The result runs at roughly €0/month.

That choice has a visible cost, and the site states it rather than hiding it:
the first request after an idle period takes about twenty seconds while a
container cold-starts, against roughly 300ms once warm. Keeping a container
resident would remove the wait and replace it with a permanent monthly bill —
the wrong trade for a project whose point is that it can sit idle indefinitely.
The frontend explains this on the first slow request instead of showing a bare
spinner, because an unexplained twenty-second wait reads as a broken app.

No secrets exist anywhere in the deployment, as a property of the design rather
than of discipline. The container registry is public, so there are no registry
credentials to hold. Storage shared keys are disabled at the account level, so
no key or SAS token exists to leak — key-based access is refused by the
platform, including for Terraform itself, which authenticates with Entra ID.
The backend identity holds exactly one role, scoped to the single blob
container it reads, rather than to the storage account.

The stack was destroyed and rebuilt from scratch to prove it is reproducible
rather than merely deployable once. That exercise surfaced something worth
knowing: Azure assigns new hostnames on recreate, and since the API URL is
compiled into the frontend bundle at build time, a rebuild and redeploy is part
of the recovery, not an afterthought.

## Evaluation

Two public datasets are used as sanity checks rather than benchmarks, and the
repository is explicit about the difference. FEVER, whose claims carry supported,
refuted and not-enough-info labels, checks that risk scores separate in the
expected direction. CUAD, a corpus of expert-annotated contracts, stress-tests
ingestion, vague-clause detection and triage on long documents.

Neither is run as a full benchmark, and neither is presented as a measure of
hallucination-detection accuracy.

## Limitations

The scorer is transparent, not a truth engine. It can miss implicit support,
evidence that only exists in a table, and domain-specific nuance, and PDF
handling is only as good as the embedded text. Every document shipped with the
project is synthetic, so nothing in the repository contains client or personal
data.
