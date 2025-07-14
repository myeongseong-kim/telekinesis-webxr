export class GrabPose {
  static CURL_CLOSE_THRESHOLD = 240;
  static FLEXION_CLOSE_THRESHOLD = 225;

  static isSelected(pose) {
    let state = (
      pose.fingerFeatures.index.curl > GrabPose.CURL_CLOSE_THRESHOLD &&
      pose.fingerFeatures.index.flexion > GrabPose.FLEXION_CLOSE_THRESHOLD &&
      pose.fingerFeatures.middle.curl > GrabPose.CURL_CLOSE_THRESHOLD &&
      pose.fingerFeatures.middle.flexion > GrabPose.FLEXION_CLOSE_THRESHOLD &&
      pose.fingerFeatures.ring.curl > GrabPose.CURL_CLOSE_THRESHOLD &&
      pose.fingerFeatures.ring.flexion > GrabPose.FLEXION_CLOSE_THRESHOLD
    );
    return state;
  }
}