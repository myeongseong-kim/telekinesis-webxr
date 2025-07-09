import { HAND_BONES, getBoneRight, getBoneUp, getBoneForward, getBonePos } from './hand-utils.js';

export class FingerFeature {
  constructor(finger, handTracking) {
    this.handTracking = handTracking; // hand-tracking-controls
    this.finger = HAND_BONES[finger];

    this.values = {
      curl: null,
      flexion: null,
      abduction: null,
      opposition: null,
    }
  }

  update() {
    if (!this.handTracking.hasPoses || !this.handTracking.bones) {
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
    let axis;

    if (this.finger == HAND_BONES.thumb) {
      bone1 = this.handTracking.getBone(this.finger.metacarpal);
      bone2 = this.handTracking.getBone(this.finger.proximal);
      bone3 = this.handTracking.getBone(this.finger.distal);
    } else {
      bone1 = this.handTracking.getBone(this.finger.proximal);
      bone2 = this.handTracking.getBone(this.finger.intermediate);
      bone3 = this.handTracking.getBone(this.finger.distal);
    }

    if (!bone1 || !bone2 || !bone3) {
      return null;
    }

    axis = getBoneRight(bone1);
    let angle1 = signedAngle(getBoneForward(bone1), getBoneForward(bone2), axis);
    let angle2 = signedAngle(getBoneForward(bone2), getBoneForward(bone3), axis);

    let curl = 180 + THREE.MathUtils.radToDeg(0.5 * (angle1 + angle2));
    return curl;
  }

  _calculateFlexion() {
    let bone0;
    let bone1;
    let axis;

    bone0 = this.handTracking.getBone(HAND_BONES.wrist);
    if (this.finger == HAND_BONES.thumb) {
      bone1 = this.handTracking.getBone(this.finger.metacarpal);
    } else {
      bone1 = this.handTracking.getBone(this.finger.proximal);
    }

    if (!bone0 || !bone1) {
      return null;
    }

    axis = new THREE.Vector3().copy(getBoneRight(bone0));
    let angle = signedAngle(getBoneForward(bone0), getBoneForward(bone1), axis);
    let flexion = 180 + THREE.MathUtils.radToDeg(angle);

    return flexion;
  }

  _calculateAbduction() {
    let bone0;
    let bone1;
    let axis;

    bone0 = this.handTracking.getBone(HAND_BONES.wrist);
    if (this.finger == HAND_BONES.thumb) {
      bone1 = this.handTracking.getBone(this.finger.metacarpal);
    } else {
      bone1 = this.handTracking.getBone(this.finger.proximal);
    }

    if (!bone0 || !bone1) {
      return null;
    }

    axis = new THREE.Vector3().copy(getBoneUp(bone0));
    if (this.handTracking.data.hand == 'left') {
      axis.negate();
    }

    let angle = signedAngle(getBoneForward(bone0), getBoneForward(bone1), axis);
    let abduction = THREE.MathUtils.radToDeg(angle);

    return abduction;
  }

  _calculateOpposition() {
    let bone0;
    let bone1;

    bone0 = this.handTracking.getBone(HAND_BONES.thumb.tip);
    bone1 = this.handTracking.getBone(this.finger.tip);

    if (!bone0 || !bone1) {
      return null;
    }

    let thumbTipPos = getBonePos(bone0);
    let fingerTipPos = getBonePos(bone1);

    let dist = thumbTipPos.distanceTo(fingerTipPos);
    let opposition = dist;

    return opposition;
  }
}


function signedAngle(vec1, vec2, axis) {
  let angle = vec1.angleTo(vec2);
  let cross = new THREE.Vector3().crossVectors(vec1, vec2).negate();
  let dot = cross.dot(axis);
  return dot * angle;
}