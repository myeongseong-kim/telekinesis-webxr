import { HandPose } from './hand-pose.js';
import { HAND_BONES } from './hand-utils.js';

AFRAME.registerComponent('hand-pose-controls', {
  schema: {
    debug: { type: 'boolean', default: false }
  },

  init: function () {
    this.handEntity = this.el;
    this.handTracking = this.handEntity.components['hand-tracking-controls'];
    this.handedness = this.handTracking.data.hand;
    this.handPose = new HandPose(this.handEntity);

    this.currentPose = null;
    this.previousPose = null;
    this.currentTransform = null;
    this.previousTransform = null;

    this.featureTextEntities = {};

    this.fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    this.features = ['curl', 'flexion', 'abduction', 'opposition'];

    this._setupDebugText();
  },


  tick: function (time, deltaTime) {
    if (this.handTracking && this.handTracking.bones) {
      this.previousPose = this.currentPose;
      this.previousTransform = this.currentTransform;

      this.handPose.update();

      this.currentPose = this.handPose.snapshot();
      this.currentTransform = this.handTracking.getBone(HAND_BONES.wrist).matrixWorld.clone();

      if (this.data.debug) {
        this._updateDebugText();
      }
    }
  },

  remove: function () { },

  getPointerPosition: function () {
    let rootBone = this.handTracking.getBone(HAND_BONES.wrist).clone();
    
    let offsetDir = new THREE.Vector3().setFromMatrixColumn(rootBone.matrixWorld.clone(), 1)
    let offsetDist = -0.05;
    let offset = offsetDir.multiplyScalar(offsetDist);
    
    let pos = new THREE.Vector3();
    this.handTracking.getBone(HAND_BONES.index.proximal).getWorldPosition(pos);
    pos.add(offset);

    return pos;
  },

  getRootPosition: function () {
    let rootBone = this.handTracking.getBone(HAND_BONES.wrist).clone();
    let pos = new THREE.Vector3();
    rootBone.getWorldPosition(pos);
    return pos;
  },

  getRootRotation: function () {
    let rootBone = this.handTracking.getBone(HAND_BONES.wrist).clone();
    let rot = new THREE.Quaternion();
    rootBone.getWorldQuaternion(rot);
    return rot;
  },

  _setupDebugText: function () {
    this.fingers.forEach((finger) => {
      this.featureTextEntities[finger] = {};

      this.features.forEach((feature) => {
        const textEntity = document.createElement('a-entity');
        textEntity.setAttribute('text', {
          value: 'N/A',
          color: '#FF0000',
          align: 'center',
          width: 0.05,
          wrapCount: 20,
          shader: 'msdf',
          negate: true,
        });

        textEntity.setAttribute('visible', 'false');

        this.handEntity.appendChild(textEntity);
        this.featureTextEntities[finger][feature] = textEntity;
      });
    });
  },

  _updateDebugText: function () {
    let root = this.handTracking.getBone(HAND_BONES.wrist);
    root.updateMatrixWorld(true);
    let invRootMatrix = root.matrixWorld.clone().invert();

    const cameraPos = new THREE.Vector3();
    this.el.sceneEl.camera.getWorldPosition(cameraPos);
    const offsetDist = 0.025;

    let displayValue;
    let bone;
    let boneMatrix;
    let matrix;
    let pos;

    this.fingers.forEach((finger) => {
      this.features.forEach((feature) => {
        let textEntity = this.featureTextEntities[finger][feature];

        let value = this.handPose.fingerFeatures[finger].values[feature];
        if (value == undefined) {
          textEntity.setAttribute('visible', 'false');
          textEntity.setAttribute('text', { value: '' });
        } else if (value == null) {
          textEntity.setAttribute('visible', 'true');
          textEntity.setAttribute('text', { value: 'Null' });
        } else {
          textEntity.setAttribute('visible', 'true');
        }

        switch (feature) {
          case 'curl':
            displayValue = value.toFixed(1);
            bone = this.handTracking.getBone(HAND_BONES[finger].distal);
            break;
          case 'flexion':
            displayValue = value.toFixed(1);
            if (finger == 'thumb') {
              bone = this.handTracking.getBone(HAND_BONES[finger].proximal);
            } else {
              bone = this.handTracking.getBone(HAND_BONES[finger].intermediate);
            }
            break;
          case 'abduction':
            displayValue = value.toFixed(1);
            if (finger == 'thumb') {
              bone = this.handTracking.getBone(HAND_BONES[finger].metacarpal);
            } else {
              bone = this.handTracking.getBone(HAND_BONES[finger].proximal);
            }
            break;
          case 'opposition':
            displayValue = (1000 * value).toFixed(1);
            bone = this.handTracking.getBone(HAND_BONES[finger].tip);
            break;
        }

        bone.updateMatrixWorld(true);
        textEntity.setAttribute('text', { value: `${displayValue}` });

        boneMatrix = bone.matrixWorld.clone();
        matrix = new THREE.Matrix4().multiplyMatrices(invRootMatrix, boneMatrix);
        pos = new THREE.Vector3().setFromMatrixColumn(matrix, 3);

        textEntity.object3D.position.copy(pos);
        textEntity.object3D.lookAt(cameraPos);
        textEntity.object3D.translateZ(offsetDist);
      });
    });
  },
});
