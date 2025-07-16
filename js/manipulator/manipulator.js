import { PinchPose } from '../poses/pinch-pose.js';
import { GrabPose } from '../poses/grab-pose.js';
import { LockPose } from '../poses/lock-pose.js';
import { ModeManager } from '../mode-manager.js';
import { IdleMode } from './manipulator-modes/idle-mode.js';
import { UniManualMode } from './manipulator-modes/uni-manual-mode.js';
import { BiManualMode } from './manipulator-modes/bi-manual-mode.js';
import { UniManipulateMode } from './manipulator-modes/uni-manipulate-mode.js';
import { UniTranslateMode } from './manipulator-modes/uni-translate-mode.js';
import { BiManipulateMode } from './manipulator-modes/bi-manipulate-mode.js';
import { BiTranslateMode } from './manipulator-modes/bi-translate-mode.js';
import { BiRotateMode } from './manipulator-modes/bi-rotate-mode.js';

AFRAME.registerComponent('manipulator', {
  schema: {
    target: { type: 'selector' },
    plane: { type: 'selector', default: '#planeIndicator' },
    sphere: { type: 'selector', default: '#sphereIndicator' },
  },

  init: function () {
    this.modeManager = new ModeManager(this);
    this.modeManager.add(new IdleMode(this));
    this.modeManager.add(new UniManualMode(this));
    this.modeManager.add(new BiManualMode(this));
    this.modeManager.add(new UniManipulateMode(this));
    this.modeManager.add(new UniTranslateMode(this));
    this.modeManager.add(new BiManipulateMode(this));
    this.modeManager.add(new BiTranslateMode(this));
    this.modeManager.add(new BiRotateMode(this));
    this.modeManager.initTo(this.modeManager.modes['Idle']);

    this.sensitivity = 1.0;

    this.leftHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: left"]');
    this.rightHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: right"]');

    this.leftHandPose = this.leftHandEntity.components['hand-pose-controls'];
    this.rightHandPose = this.rightHandEntity.components['hand-pose-controls'];

    this.targetEntity = this.data.target;
    this.planeEntity = this.data.plane;
    this.sphereEntity = this.data.sphere;
  },

  tick: function (time, deltaTime) {
    if (this.leftHandPose) {
      let leftCurrentPose = this.leftHandPose.currentPose;
      let leftPreviousPose = this.leftHandPose.previousPose;
      if (!leftCurrentPose || !leftPreviousPose) return;

      if (PinchPose.isSelected(leftCurrentPose) && !PinchPose.isSelected(leftPreviousPose)) {
        // console.log('Left hand pinch started');
        this.modeManager.currentMode.handlePinchStart(this.leftHandEntity);
      }
      else if (!PinchPose.isSelected(leftCurrentPose) && PinchPose.isSelected(leftPreviousPose)) {
        // console.log('Left hand pinch ended');
        this.modeManager.currentMode.handlePinchEnd(this.leftHandEntity);
      }

      if (GrabPose.isSelected(leftCurrentPose) && !GrabPose.isSelected(leftPreviousPose)) {
        // console.log('Left hand grab started');
        this.modeManager.currentMode.handleGrabStart(this.leftHandEntity);
      }
      else if (!GrabPose.isSelected(leftCurrentPose) && GrabPose.isSelected(leftPreviousPose)) {
        // console.log('Left hand grab ended');
        this.modeManager.currentMode.handleGrabEnd(this.leftHandEntity);
      }

      if (LockPose.isSelected(leftCurrentPose) && !LockPose.isSelected(leftPreviousPose)) {
        // console.log('Left hand lock started');
        this.modeManager.currentMode.handleLockStart(this.leftHandEntity);
      }
      else if (!LockPose.isSelected(leftCurrentPose) && LockPose.isSelected(leftPreviousPose)) {
        // console.log('Left hand lock ended');
        this.modeManager.currentMode.handleLockEnd(this.leftHandEntity);
      }
    }
    if (this.rightHandPose) {
      let rightCurrentPose = this.rightHandPose.currentPose;
      let rightPreviousPose = this.rightHandPose.previousPose;
      if (!rightCurrentPose || !rightPreviousPose) return;

      if (PinchPose.isSelected(rightCurrentPose) && !PinchPose.isSelected(rightPreviousPose)) {
        // console.log('Right hand pinch started');
        this.modeManager.currentMode.handlePinchStart(this.rightHandEntity);
      }
      else if (!PinchPose.isSelected(rightCurrentPose) && PinchPose.isSelected(rightPreviousPose)) {
        // console.log('Right hand pinch ended');
        this.modeManager.currentMode.handlePinchEnd(this.rightHandEntity);
      }

      if (GrabPose.isSelected(rightCurrentPose) && !GrabPose.isSelected(rightPreviousPose)) {
        // console.log('Right hand grab started');
        this.modeManager.currentMode.handleGrabStart(this.rightHandEntity);
      }
      else if (!GrabPose.isSelected(rightCurrentPose) && GrabPose.isSelected(rightPreviousPose)) {
        // console.log('Right hand grab ended');
        this.modeManager.currentMode.handleGrabEnd(this.rightHandEntity);
      }

      if (LockPose.isSelected(rightCurrentPose) && !LockPose.isSelected(rightPreviousPose)) {
        // console.log('Right hand lock started');
        this.modeManager.currentMode.handleLockStart(this.rightHandEntity);
      }
      else if (!LockPose.isSelected(rightCurrentPose) && LockPose.isSelected(rightPreviousPose)) {
        // console.log('Right hand lock ended');
        this.modeManager.currentMode.handleLockEnd(this.rightHandEntity);
      }
    }

    if (this.modeManager.currentMode) {
      this.el.sceneEl.object3D.updateMatrixWorld(true);
      this.modeManager.currentMode.execute();
    }
  },

  remove: function () { },
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
