export class LockPose {
  constructor(handEntity) {
    this.handEntity = handEntity;
    this.flag = false;
  }

  static CURL_OPEN_SELECT_THRESHOLD = 195;
  static FLEXION_OPEN_SELECT_THRESHOLD = 210;
  static CURL_OPEN_UNSELECT_THRESHOLD = 210;
  static FLEXION_OPEN_UNSELECT_THRESHOLD = 225;

  isSelected(pose) {
    let state = (
      pose.fingerFeatures.middle.curl < LockPose.CURL_OPEN_SELECT_THRESHOLD &&
      pose.fingerFeatures.middle.flexion < LockPose.FLEXION_OPEN_SELECT_THRESHOLD &&
      pose.fingerFeatures.ring.curl < LockPose.CURL_OPEN_SELECT_THRESHOLD &&
      pose.fingerFeatures.ring.flexion < LockPose.FLEXION_OPEN_SELECT_THRESHOLD
    );
    return state;
  }

  isUnselected(pose) {
    let state = (
      pose.fingerFeatures.middle.curl > LockPose.CURL_OPEN_SELECT_THRESHOLD &&
      pose.fingerFeatures.middle.flexion > LockPose.FLEXION_OPEN_SELECT_THRESHOLD &&
      pose.fingerFeatures.ring.curl > LockPose.CURL_OPEN_SELECT_THRESHOLD &&
      pose.fingerFeatures.ring.flexion > LockPose.FLEXION_OPEN_SELECT_THRESHOLD
    );
    return state;
  }
}