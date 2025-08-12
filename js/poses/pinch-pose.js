export class PinchPose {
  constructor(handEntity) {
    this.handEntity = handEntity;
    this.flag = false;
  }

  static PINCH_SELECT_THRESHOLD = 0.01;
  static PINCH_UNSELECT_THRESHOLD = 0.02;

  isSelected(pose) {
    return pose.fingerFeatures.index.opposition < PinchPose.PINCH_SELECT_THRESHOLD;
  }
  isUnselected(pose) {
    return pose.fingerFeatures.index.opposition > PinchPose.PINCH_UNSELECT_THRESHOLD;
  }
}