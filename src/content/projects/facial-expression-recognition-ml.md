---
title: Facial Expression Recognition with Classical ML
summary: >-
  Computer-vision pipeline that detects a face, extracts HOG features and
  classifies it into seven expressions, built as a transparent classical
  baseline rather than a deep-learning system.
domain: ai-ml
stack: [Python, OpenCV, scikit-learn, HOG, SVM]
repoUrl: https://github.com/GeorgeAnes/facial-expression-recognition-ml
featured: true
order: 3
role: University project, curated public version
# CONFIRM: accuracy 0.523 and balanced accuracy 0.508 are quoted from the
# README's public test split. George to confirm before launch.
results:
  - Accuracy 0.523 on the public test split
  - Balanced accuracy 0.508, against a seven-class chance rate near 0.14
heroImage: ../../assets/projects/facial-expression-recognition-ml/example_pipeline.png
heroImageAlt: >-
  Pipeline diagram running from a camera or FER2013 image through face detection
  and cropping, 48x48 grayscale normalization, HOG feature extraction and a
  scaler plus classifier, to an emotion label with a confidence value.
figures:
  - src: ../../assets/projects/facial-expression-recognition-ml/model_comparison.png
    alt: Bar chart comparing accuracy across the classical models that were trained.
    caption: Model comparison across the classical classifiers evaluated.
  - src: ../../assets/projects/facial-expression-recognition-ml/confusion_matrix_private.png
    alt: >-
      Confusion matrix on the private test split, showing which of the seven
      expression classes are most often mistaken for each other.
    caption: Confusion matrix on the private test split.
---

## Problem

Classify a face image into seven expressions, angry, disgust, fear, happy, sad,
surprise and neutral, at a cost light enough to run on laptop-camera frames in
approximately real time.

## Approach

The pipeline detects a frontal face with an OpenCV Haar cascade, crops and
converts it to a 48x48 grayscale image, extracts Histogram of Oriented Gradients
features, and classifies the resulting fixed-length vector. Several classical
models were trained and compared, including an SVM, an MLP, a random forest and
a fuzzy-system variant, and evaluated with accuracy, balanced accuracy,
classification reports and confusion matrices.

An SVM over HOG features was selected as the baseline.

## What the numbers mean

The seven-class problem has a chance rate near 0.14, so a balanced accuracy
around 0.51 is a working classical baseline rather than a solved problem. The
confusion matrices are the more informative artefact: the errors concentrate
between expressions that are genuinely close in appearance.

This is a transparent baseline, not a production emotion-recognition system, and
it should not be treated as one.

## Data

The public version does not redistribute the restricted dataset. It keeps the
code, the structure and the recorded evaluation outputs, and expects
FER2013-style inputs.
