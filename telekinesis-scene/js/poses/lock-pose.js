export class LockPose {
  static CURL_OPEN_THRESHOLD = 195;
  static FLEXION_OPEN_THRESHOLD = 210;

  static isSelected(pose) {
    let state = (
      pose.fingerFeatures.middle.curl < LockPose.CURL_OPEN_THRESHOLD &&
      pose.fingerFeatures.middle.flexion < LockPose.FLEXION_OPEN_THRESHOLD &&
      pose.fingerFeatures.ring.curl < LockPose.CURL_OPEN_THRESHOLD &&
      pose.fingerFeatures.ring.flexion < LockPose.FLEXION_OPEN_THRESHOLD
    );
    return state;
  }
}