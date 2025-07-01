import { HandPose } from './hand-pose.js';
import { HAND_BONES, getBoneDir, getBonePos } from './hand-utils.js';

AFRAME.registerComponent('hand-pose-controls', {
  schema: {},

  init: function () {
    this.handEntity = this.el;
    this.handTracking = this.handEntity.components['hand-tracking-controls'];
    this.handPose = new HandPose(this.handEntity);

    this.featureTextEntities = {};

    this.fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    this.features = ['curl', 'flexion', 'abduction', 'opposition'];

    this._setupDebugText();

    // Create the box and add it directly to the scene (world space)
    const boxEl = document.createElement('a-box');
    boxEl.setAttribute('color', '#00FF00'); // Green color
    boxEl.setAttribute('width', '0.02'); // Small size
    boxEl.setAttribute('height', '0.02');
    boxEl.setAttribute('depth', '0.02');
    boxEl.setAttribute('position', '0 0 0'); // Initial position
    boxEl.setAttribute('visible', 'false'); // Hide initially until hand is tracked
    document.querySelector('a-scene').appendChild(boxEl);
    this.indexTipBox = boxEl; // Store reference to the box
  },
  

  tick: function (time, deltaTime) {
    if (this.handTracking && this.handTracking.bones) {
      this.handPose.update();
      this._updateDebugText();

      const indexTipBone = this.handTracking.bones[HAND_BONES.index.tip];
      if (indexTipBone) {
        const pos = new THREE.Vector3().setFromMatrixColumn(indexTipBone.matrixWorld, 3);

        this.indexTipBox.object3D.position.copy(pos);
        this.indexTipBox.setAttribute('visible', 'true'); // Make it visible once tracked
      } else {
        this.indexTipBox.setAttribute('visible', 'false'); // Hide if hand is not tracked
      }
    }
  },

  remove: function () {},

  _setupDebugText: function () {
    this.fingers.forEach((finger) => {
      this.featureTextEntities[finger] = {};

      this.features.forEach((feature) => {
        const textEl = document.createElement('a-entity');
        textEl.setAttribute('text', {
          value: 'N/A',
          color: '#FF0000',
          align: 'center',
          width: 0.1,
          wrapCount: 20,
          shader: 'msdf',
          negate: true,
        });

        textEl.setAttribute('material', { shader: 'msdf', 'render-queue': 3001 });
        textEl.setAttribute('visible', 'false');

        // this.handEntity.appendChild(textEl);
        document.querySelector('a-scene').appendChild(textEl);
        this.featureTextEntities[finger][feature] = textEl;
      });
    });
  },

  _updateDebugText: function () {
    this.fingers.forEach((finger) => {
      this.features.forEach((feature) => {
        let textEntity = this.featureTextEntities[finger][feature];

        let value = this.handPose.fingerFeatures[finger].values[feature];
        if (value == undefined) {
          textEntity.setAttribute('visible', 'false');
        } else if (value == null) {
          textEntity.setAttribute('visible', 'true');
          textEntity.setAttribute('text', { value: 'N/A' });
        } else {
          textEntity.setAttribute('visible', 'true');
          textEntity.setAttribute('text', { value: `${value}` });
        }

        switch (feature) {
          case 'curl':
            textEntity.setAttribute('visible', 'false');
            break;
          case 'flexion':
            textEntity.setAttribute('visible', 'false');
            break;
          case 'abduction':
            textEntity.setAttribute('visible', 'false');
            break;
          case 'opposition':
            let bone = this.handTracking.bones[HAND_BONES[finger].tip];

            let rootMatrix = this.handEntity.object3D.matrixWorld.clone();
            let boneMatrix = bone.matrixWorld.clone();

            let boneMatrixLocal = new THREE.Matrix4().multiplyMatrices(rootMatrix.invert(), boneMatrix);
            let pos = new THREE.Vector3().setFromMatrixColumn(boneMatrixLocal, 3);

            // textEntity.object3D.position.copy(pos);
            textEntity.object3D.position.copy(new THREE.Vector3().setFromMatrixColumn(bone.matrixWorld, 3));
            break;
        }
      });
    });
  },
});
