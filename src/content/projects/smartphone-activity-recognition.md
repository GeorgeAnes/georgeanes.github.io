---
title: Smartphone Activity Recognition from IMU Signals
summary: >-
  Classifies human activity from phone accelerometer and gyroscope signals, with
  participant-level validation that shows how far the model actually generalizes
  to people it has never seen.
domain: ai-ml
stack: [Python, NumPy, pandas, scikit-learn, Signal Processing]
repoUrl: https://github.com/GeorgeAnes/smartphone-activity-recognition
# CONFIRM: balanced accuracy 0.962 (stratified holdout) and 0.628 mean
# (leave-one-participant-out), both random forest, quoted from the README
# benchmark table. George to confirm before launch.
results:
  - Balanced accuracy 0.962 on a stratified holdout, random forest
  - Balanced accuracy 0.628 mean under leave-one-participant-out validation
heroImage: ../../assets/projects/smartphone-activity-recognition/har_lopo_results.png
heroImageAlt: >-
  Results chart for leave-one-participant-out validation, showing balanced
  accuracy per held-out participant and the spread between them.
figures:
  - src: ../../assets/projects/smartphone-activity-recognition/har_feature_importance.png
    alt: >-
      Ranked feature importance chart showing which time-domain and
      frequency-domain features contribute most to the classifier.
    caption: Ranked feature importance across the engineered feature set.
  - src: ../../assets/projects/smartphone-activity-recognition/har_class_balance.png
    alt: Bar chart of how many windows fall into each activity class.
    caption: Class balance across activity labels in the feature table.
---

## Problem

Phone IMU signals can distinguish sitting, standing, walking, running and stair
climbing. The harder question is whether a model trained on one set of people
still works on someone new, since gait and phone placement vary between
individuals.

## Approach

Accelerometer and gyroscope streams are cut into windows, then summarised with
time-domain statistics and frequency-domain energy features. Feature selection
uses mutual information and recursive feature elimination. Several classifiers
were compared, including logistic regression, decision trees, naive Bayes and
k-nearest neighbours.

## The result that matters

The gap between the two validation schemes is the finding. A stratified holdout
scores far higher than leave-one-participant-out validation, because a random
split lets windows from the same person land in both training and test data.
Holding out a whole participant removes that leakage, and the score drops
sharply.

The lower number is the honest estimate of how the model behaves on a new user.
Reporting only the holdout figure would overstate the system by a wide margin.

## Data

The raw recordings are not published, since they contain participant sensor
traces. The repository ships a derived feature table with participant identifiers
anonymised and timestamps and local paths removed.
