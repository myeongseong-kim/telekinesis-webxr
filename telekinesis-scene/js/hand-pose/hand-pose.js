import { FingerFeature } from './finger-feature.js';

export class HandPose {
  constructor(handEntity) {
    this.handEntity = handEntity;
    this.handTracking = handEntity.components['hand-tracking-controls'];

    this.fingerFeatures = {
      thumb: new FingerFeature('thumb', this.handTracking),
      index: new FingerFeature('index', this.handTracking),
      middle: new FingerFeature('middle', this.handTracking),
      ring: new FingerFeature('ring', this.handTracking),
      pinky: new FingerFeature('pinky', this.handTracking),
    };
  }

  update() {
    this.fingerFeatures.thumb.update();
    this.fingerFeatures.index.update();
    this.fingerFeatures.middle.update();
    this.fingerFeatures.ring.update();
    this.fingerFeatures.pinky.update();
  }

  snapshot() {
    const pose = { fingerFeatures: {} };
    for (const finger in this.fingerFeatures) {
      const values = this.fingerFeatures[finger].values;

      const copy = {};
      for (const feature in values) {
        copy[feature] = values[feature];
      }

      pose.fingerFeatures[finger] = copy;
    }
    return pose;
  }
}
