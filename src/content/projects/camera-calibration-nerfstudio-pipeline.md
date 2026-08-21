---
title: Camera Calibration and NeRFStudio Pipeline
summary: >-
  Python pipeline that calibrates a camera from an ArUco board, estimates poses,
  and converts them into the transforms NeRFStudio expects for 3D
  reconstruction.
domain: ai-ml
stack: [Python, OpenCV, ArUco, NumPy, NeRFStudio]
repoUrl: https://github.com/GeorgeAnes/camera-calibration-nerfstudio-pipeline
heroImage: ../../assets/projects/camera-calibration-nerfstudio-pipeline/top_view.png
heroImageAlt: >-
  Top-down visualization of estimated camera poses arranged around the
  calibration board, showing where each shot was taken from.
figures:
  - src: ../../assets/projects/camera-calibration-nerfstudio-pipeline/side_view_x.png
    alt: >-
      Side view of the same estimated camera poses, showing their height and
      orientation relative to the board.
    caption: The same pose set viewed from the side.
---

## Problem

Neural reconstruction methods only work if they are told accurately where each
photograph was taken from. Getting there means calibrating the camera's
intrinsics, estimating a pose per image, and then expressing all of it in the
convention the reconstruction tool expects. Small errors in that chain show up
as visible artefacts later.

## Approach

The pipeline detects ArUco markers with OpenCV against a custom board whose 3D
marker coordinates are known, calibrates the camera intrinsics, and estimates
poses using Zhang-style planar calibration geometry. It then converts poses from
OpenCV's convention to OpenGL's, which is what NeRFStudio expects, and writes a
compatible `transforms.json`.

The conversion step is the one that quietly breaks reconstructions when it is
wrong, so the pipeline also renders static and interactive pose visualizations.
Seeing the camera positions laid out in space is the fastest way to catch a
flipped axis before spending time on a reconstruction.

## Data

Raw calibration image folders are not published, since they are large and add
nothing to a code review. The repository ships derived outputs and the pose
visualizations; a full run expects local calibration images.
