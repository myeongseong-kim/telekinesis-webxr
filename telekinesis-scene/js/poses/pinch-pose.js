export class PinchPose {
  static PINCH_THRESHOLD = 0.015;

  static isSelected(pose) {
    return pose.fingerFeatures.index.opposition < PinchPose.PINCH_THRESHOLD;
  }
}