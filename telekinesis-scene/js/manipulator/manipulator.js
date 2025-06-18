import { ModeManager } from '../mode-manager.js';
import { IdleMode } from './manipulator-modes/idle-mode.js';
import { UniManualMode } from './manipulator-modes/uni-manual-mode.js';
import { BiManualMode } from './manipulator-modes/bi-manual-mode.js';

AFRAME.registerComponent('manipulator', {
  schema: {
    target: { type: 'selector' },
    plane: { type: 'selector', default: '#planeIndicator' },
  },

  init: function () {
    this.modeManager = new ModeManager(this);
    this.modeManager.add(new IdleMode(this));
    this.modeManager.add(new UniManualMode(this));
    this.modeManager.add(new BiManualMode(this));
    this.modeManager.initTo(this.modeManager.modes['Idle']);

    this.leftHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: left"]');
    this.rightHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: right"]');

    this.targetEntity = this.data.target;
    this.planeEntity = this.data.plane;

    this.pinchStartHandler = this.onPinchStart.bind(this);
    this.pinchEndHandler = this.onPinchEnd.bind(this);

    if (this.leftHandEntity) {
      this.leftHandEntity.addEventListener('pinchstarted', this.pinchStartHandler);
      this.leftHandEntity.addEventListener('pinchended', this.pinchEndHandler);
    }
    if (this.rightHandEntity) {
      this.rightHandEntity.addEventListener('pinchstarted', this.pinchStartHandler);
      this.rightHandEntity.addEventListener('pinchended', this.pinchEndHandler);
    }
  },

  onPinchStart: function (evt) {
    this.modeManager.currentMode.handlePinchStart(evt.target);
  },

  onPinchEnd: function (evt) {
    this.modeManager.currentMode.handlePinchEnd(evt.target);
  },

  tick: function (time, deltaTime) {
    if (this.modeManager.currentMode) {
      this.modeManager.currentMode.execute();
    }
  },

  remove: function () {
    if (this.leftHandEntity) {
      this.leftHandEntity.removeEventListener('pinchstarted', this.pinchStartHandler);
      this.leftHandEntity.removeEventListener('pinchended', this.pinchEndHandler);
    }
    if (this.rightHandEntity) {
      this.rightHandEntity.removeEventListener('pinchstarted', this.pinchStartHandler);
      this.rightHandEntity.removeEventListener('pinchended', this.pinchEndHandler);
    }
  },
});

export function setWorldTransform(entity, pos, rot, scl) {
  let transform = new THREE.Matrix4().compose(pos, rot, scl);

  let localPos = new THREE.Vector3();
  let localRot = new THREE.Quaternion();
  let localScl = new THREE.Vector3();
  let localTransform = transform.clone();

  if (entity.parent) {
    entity.parent.updateMatrixWorld(true);
    let inverseParentTransform = entity.parent.matrixWorld.clone().invert();
    localTransform.premultiply(inverseParentTransform);
  }
  localTransform.decompose(localPos, localRot, localScl);

  entity.position.copy(localPos);
  entity.quaternion.copy(localRot);
  entity.scale.copy(localScl);
  entity.updateMatrixWorld(true);
}
