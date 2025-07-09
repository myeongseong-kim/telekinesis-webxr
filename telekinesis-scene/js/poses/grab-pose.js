export class GrabPose {
  constructor(handEntity) {
    this.handEntity = handEntity;
    this.flag = false;
  }

  static CURL_CLOSE_SELECT_THRESHOLD = 240;
  static FLEXION_CLOSE_SELECT_THRESHOLD = 225;
  static CURL_CLOSE_UNSELECT_THRESHOLD = 225;
  static FLEXION_CLOSE_UNSELECT_THRESHOLD = 210;

  isSelected(pose) {
    let state = (
      pose.fingerFeatures.index.curl > GrabPose.CURL_CLOSE_SELECT_THRESHOLD &&
      pose.fingerFeatures.index.flexion > GrabPose.FLEXION_CLOSE_SELECT_THRESHOLD &&
      pose.fingerFeatures.middle.curl > GrabPose.CURL_CLOSE_SELECT_THRESHOLD &&
      pose.fingerFeatures.middle.flexion > GrabPose.FLEXION_CLOSE_SELECT_THRESHOLD &&
      pose.fingerFeatures.ring.curl > GrabPose.CURL_CLOSE_SELECT_THRESHOLD &&
      pose.fingerFeatures.ring.flexion > GrabPose.FLEXION_CLOSE_SELECT_THRESHOLD
    );
    return state;
  }

  isUnselected(pose) {
    let state = (
      pose.fingerFeatures.index.curl < GrabPose.CURL_CLOSE_UNSELECT_THRESHOLD &&
      pose.fingerFeatures.index.flexion < GrabPose.FLEXION_CLOSE_UNSELECT_THRESHOLD &&
      pose.fingerFeatures.middle.curl < GrabPose.CURL_CLOSE_UNSELECT_THRESHOLD &&
      pose.fingerFeatures.middle.flexion < GrabPose.FLEXION_CLOSE_UNSELECT_THRESHOLD &&
      pose.fingerFeatures.ring.curl < GrabPose.CURL_CLOSE_UNSELECT_THRESHOLD &&
      pose.fingerFeatures.ring.flexion < GrabPose.FLEXION_CLOSE_UNSELECT_THRESHOLD
    );
    return state;
  }
}