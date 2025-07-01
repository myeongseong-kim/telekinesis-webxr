export const HAND_BONES = {
  wrist: 0,
  thumb: {
    metacarpal: 1,
    proximal: 2,
    distal: 3,
    tip: 4,
  },
  index: {
    metacarpal: 5,
    proximal: 6,
    intermediate: 7,
    distal: 8,
    tip: 9,
  },
  middle: {
    metacarpal: 10,
    proximal: 11,
    intermediate: 12,
    distal: 13,
    tip: 14,
  },
  ring: {
    metacarpal: 15,
    proximal: 16,
    intermediate: 17,
    distal: 18,
    tip: 19,
  },
  pinky: {
    metacarpal: 20,
    proximal: 21,
    intermediate: 22,
    distal: 23,
    tip: 24,
  },
};

export function getBoneDir(bone) {
  let transformMatrix = bone.matrixWorld.clone();
  let dir = new THREE.Vector3().setFromMatrixColumn(transformMatrix, 2);
  return dir;
}

export function getBonePos(bone) {
  let transformMatrix = bone.matrixWorld.clone();
  let pos = new THREE.Vector3().setFromMatrixColumn(transformMatrix, 3);
  return pos;
}
