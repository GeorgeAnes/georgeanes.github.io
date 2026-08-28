import type { ImageMetadata } from 'astro';
import ribbon from '../assets/visuals/midnight-ribbon.png';
import wave from '../assets/visuals/midnight-wave.png';
import network from '../assets/visuals/midnight-network.png';

// Decorative editorial covers. Actual project evidence remains in the case studies.
export const projectCovers: Record<string, { image: ImageMetadata; summary: string }> = {
  'enterprise-ai-document-risk-auditor': {
    image: ribbon,
    summary: 'Document review grounded in evidence, with a human in the loop.',
  },
  'vfrm-agentic-design-assistant': {
    image: wave,
    summary:
      'Agentic exploration of engineering design spaces, from models to decisions.',
  },
  'facial-expression-recognition-ml': {
    image: network,
    summary:
      'A transparent classical machine-learning baseline for facial expression recognition.',
  },
};
