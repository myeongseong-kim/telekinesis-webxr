import { HAND_BONES, getBoneDir, getBonePos } from './hand-utils.js';

export class FingerFeature {
  constructor(finger, handTracking) {
    this.handTracking = handTracking; // hand-tracking-controls
    this.finger = HAND_BONES[finger];

    this.values = {
      curl : null,
      flexion : null,
      abduction : null,
      opposition : null,
    }
  }

  update() {
    if (!this.handTracking.hasPoses || !this.handTracking.bones) {
      // console.log("Hand-tracking Losts");
      this.values.curl = null;
      this.values.flexion = null;
      this.values.abduction = null;
      this.values.opposition = null;
      return;
    }

    this.values.curl = this._calculateCurl();
    this.values.flexion = this._calculateFlexion();
    this.values.abduction = this._calculateAbduction();
    this.values.opposition = this._calculateOpposition();
  }

  _calculateCurl() {
    let bone1;
    let bone2;
    let bone3;

    if (this.finger == HAND_BONES.thumb) {
      bone1 = this.handTracking.bones[this.finger.metacarpal];
      bone2 = this.handTracking.bones[this.finger.proximal];
      bone3 = this.handTracking.bones[this.finger.distal];
    } else {
      bone1 = this.handTracking.bones[this.finger.proximal];
      bone2 = this.handTracking.bones[this.finger.intermediate];
      bone3 = this.handTracking.bones[this.finger.distal];
    }

    if (!bone1 || !bone2 || !bone3) {
      return null;
    }

    let angle1 = this._calculateAngleBetweenBones(bone1, bone2);
    let angle2 = this._calculateAngleBetweenBones(bone2, bone3);

    let curl = 180 + THREE.MathUtils.radToDeg(0.5 * (angle1 + angle2));
    return curl;
  }

  _calculateFlexion() {
    let bone1;
    let bone2;

    if (this.finger == HAND_BONES.thumb) {
      return undefined;
    } else {
      bone1 = this.handTracking.bones[this.finger.metacarpal];
      bone2 = this.handTracking.bones[this.finger.proximal];
    }

    if (!bone1 || !bone2) {
      return null;
    }

    let angle = this._calculateAngleBetweenBones(bone1, bone2);
    let flexion = 180 + THREE.MathUtils.radToDeg(angle);

    return flexion;
  }

  _calculateAbduction() {
    let bone0;
    let bone1;

    let adjacentFinger;
    switch (this.finger) {
      case HAND_BONES.thumb:
        adjacentFinger = HAND_BONES.index;
        break;
      case HAND_BONES.index:
        adjacentFinger = HAND_BONES.middle;
        break;
      case HAND_BONES.middle:
        adjacentFinger = HAND_BONES.ring;
        break;
      case HAND_BONES.ring:
        adjacentFinger = HAND_BONES.pinky;
        break;
      case HAND_BONES.pinky:
        return undefined;
    }
    bone0 = this.handTracking.bones[adjacentFinger.proximal];
    bone1 = this.handTracking.bones[this.finger.proximal];

    if (!bone0 || !bone1) {
      return null;
    }

    let angle = this._calculateAngleBetweenBones(bone0, bone1);
    let abduction = THREE.MathUtils.radToDeg(angle);

    return abduction;
  }

  _calculateOpposition() {
    let bone0;
    let bone1;

    if (this.finger == HAND_BONES.thumb) {
      return undefined;
    } else {
      bone0 = this.handTracking.bones[HAND_BONES.thumb.tip];
      bone1 = this.handTracking.bones[this.finger.tip];
    }

    if (!bone0 || !bone1) {
      return null;
    }

    let thumbTipPos = getBonePos(bone0);
    let fingerTipPos = getBonePos(bone1);

    let dist = thumbTipPos.distanceTo(fingerTipPos);
    let opposition = dist;

    return opposition;
  }

  _calculateAngleBetweenBones(bone1, bone2) {
    let dir1 = getBoneDir(bone1);
    let dir2 = getBoneDir(bone2);
    let rad = dir1.angleTo(dir2);
    return rad;
  }

}
