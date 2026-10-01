---
title: Embedding Lab
summary: >-
  A 64-dimension embedding model trained from scratch in NumPy on NumPy and SciPy
  docstrings, compared with TF-IDF, BM25, LSA and static-vector baselines on the
  same text and queries; the trained model loses to BM25.
domain: ai-ml
stack: [Python, NumPy, SciPy, Contrastive Learning, BM25, Retrieval Evaluation]
repoUrl: https://github.com/GeorgeAnes/embedding-lab
results:
  - On 99 fixed queries, BM25 on full text scored recall@10 0.69 against 0.44 for the 64-dimension model
  - Trained without negatives, the vectors collapsed, with a mean pairwise cosine of 0.9960 against 0.0001 with them
  - Training improved recall@10 over the untrained random projection by 0.09
heroImage: ../../assets/projects/embedding-lab/results-chart.png
heroImageAlt: >-
  Results section of the Embedding Lab report with recall@10 and all overlap
  tiers selected. A table of nine methods gives recall@10 with a bracketed
  interval, a bar with a line for the interval, and the difference to BM25 on
  full text. BM25 on full text has the longest bar, 0.69 [0.62, 0.76], and is the
  reference. Own-64 on full text is 0.44 [0.39, 0.49], 0.24 below it.
figures:
  - src: ../../assets/projects/embedding-lab/query-inspector.png
    alt: >-
      Query inspector filtered to the queries where own-64 has a target in its
      top 10 and BM25 full text does not, showing a single row, query 72, about
      fitting the coefficients of a linear model. Below it, a table gives each
      method's best target rank and its top three results, with own-64 at rank 5
      and BM25 full text at rank 26.
    caption: >-
      The one query where the small model finds a target in its top 10 and BM25
      on full text does not, with the rank and top three results for every
      method.
  - src: ../../assets/projects/embedding-lab/ablation-tables.png
    alt: >-
      Three tables from the report. The first compares the untrained model, the
      model trained with in-batch negatives and the model trained without
      negatives, with mean pairwise cosines of 0.1265, 0.0001 and 0.9960. The
      second lists runs at temperatures 0.02, 0.1 and 1.0, and the third lists
      three seeds and a run with 74 target documents held out of training.
    caption: >-
      Collapse without negatives, then the temperature and seed runs, as the
      report prints them.
---

## Problem

An embedding model is usually consumed as a service that someone else trained.
This project shows how one is produced and compares it with the lexical
retrieval used in the Enterprise AI Document Risk Auditor, on text that can be
inspected line by line.

## Approach

The model is a two-tower encoder with 64 dimensions. Each word has a learned
vector and a text is the length-normalized mean of its word vectors. It trains on
pairs of a docstring's summary line and the rest of that docstring, with a
symmetric contrastive loss and in-batch negatives.

The gradient is derived analytically, implemented in NumPy without an autodiff
library and checked against finite differences. It is optimized with Adam. A
static page in the repository shows the results and lets a reader open any query
to see how each method ranked it.

## Evaluation

The benchmark has 99 fixed queries in 33 target groups, tiered by word overlap
computed in code, with a trigram leak audit and paired cluster-bootstrap
intervals. SQuAD dev is a second, human-written query set. BM25 on full text
beat the model: recall@10 0.69 against 0.44 (0.67 against 0.41 without the 6
queries that copy a target's summary line).

Removing the negatives collapsed the vectors (mean pairwise cosine 0.996 against
0.0001), and training improved on the untrained random projection by 0.09
recall@10.

## Limitations

The encoder is a bag of word vectors, not a transformer, and it trains on the
documents it searches. The leak audit flagged 32 of the 99 queries (28 of them
in the high-overlap tier) and none were removed. The corpus has 1,714 documents.
The queries and the acceptable targets come from one author, and no second
person checked them; 6 of the 99 queries repeat a target's summary line. A run
against a real embedding model, and the Azure AI Search mapping, are not
validated.
