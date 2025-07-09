export const HAND_BONES = {
  wrist: 'wrist',
  thumb: {
    metacarpal: 'thumb-metacarpal',
    proximal: 'thumb-phalanx-proximal',
    distal: 'thumb-phalanx-distal',
    tip: 'thumb-tip'
  },
  index: {
    metacarpal: 'index-finger-metacarpal',
    proximal: 'index-finger-phalanx-proximal',
    intermediate: 'index-finger-phalanx-intermediate',
    distal: 'index-finger-phalanx-distal',
    tip: 'index-finger-tip'
  },
  middle: {
    metacarpal: 'middle-finger-metacarpal',
    proximal: 'middle-finger-phalanx-proximal',
    intermediate: 'middle-finger-phalanx-intermediate',
    distal: 'middle-finger-phalanx-distal',
    tip: 'middle-finger-tip'
  },
  ring: {
    metacarpal: 'ring-finger-metacarpal',
    proximal: 'ring-finger-phalanx-proximal',
    intermediate: 'ring-finger-phalanx-intermediate',
    distal: 'ring-finger-phalanx-distal',
    tip: 'ring-finger-tip'
  },
  pinky: {
    metacarpal: 'pinky-finger-metacarpal',
    proximal: 'pinky-finger-phalanx-proximal',
    intermediate: 'pinky-finger-phalanx-intermediate',
    distal: 'pinky-finger-phalanx-distal',
    tip: 'pinky-finger-tip'
  }
};

export function getBoneRight(bone) {
  let transformMatrix = bone.matrixWorld.clone();
  let dir = new THREE.Vector3().setFromMatrixColumn(transformMatrix, 0);
  return dir.normalize();
}

export function getBoneUp(bone) {
  let transformMatrix = bone.matrixWorld.clone();
  let dir = new THREE.Vector3().setFromMatrixColumn(transformMatrix, 1);
  return dir.normalize();
}

export function getBoneForward(bone) {
  let transformMatrix = bone.matrixWorld.clone();
  let dir = new THREE.Vector3().setFromMatrixColumn(transformMatrix, 2);
  return dir.normalize();
}

export function getBonePos(bone) {
  let transformMatrix = bone.matrixWorld.clone();
  let pos = new THREE.Vector3().setFromMatrixColumn(transformMatrix, 3);
  return pos;
}
