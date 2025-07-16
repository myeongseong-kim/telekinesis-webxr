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

    this.leftHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: left"]');
    this.rightHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: right"]');

    this.leftHandPose = this.leftHandEntity.components['hand-pose-controls'];
    this.rightHandPose = this.rightHandEntity.components['hand-pose-controls'];

    this._leftPinch = new PinchPose(this.leftHandEntity);
    this._leftGrab = new GrabPose(this.leftHandEntity);
    this._leftLock = new LockPose(this.leftHandEntity);
    this._rightPinch = new PinchPose(this.rightHandEntity);
    this._rightGrab = new GrabPose(this.rightHandEntity);
    this._rightLock = new LockPose(this.rightHandEntity);

    this.targetEntity = this.data.target;
    this.planeEntity = this.data.plane;
    this.sphereEntity = this.data.sphere;
  },

  tick: function (time, deltaTime) {
    if (this.leftHandPose) {
      const leftCurrentPose = this.leftHandPose.currentPose;
      const leftPreviousPose = this.leftHandPose.previousPose;
      if (!leftCurrentPose || !leftPreviousPose) return;

      if (this._leftGrab.isSelected(leftCurrentPose) && !this._leftGrab.flag) {
        // console.log('Left hand grab started');
        this._leftGrab.flag = true;
        this.modeManager.currentMode.handleGrabStart(this.leftHandEntity);
      }
      else if (!this._leftGrab.isSelected(leftCurrentPose) && this._leftGrab.flag) {
        // console.log('Left hand grab ended');
        this._leftGrab.flag = false;
        this.modeManager.currentMode.handleGrabEnd(this.leftHandEntity);
      }

      if (this._leftPinch.isSelected(leftCurrentPose) && !this._leftPinch.flag) {
        // console.log('Left hand pinch started');
        this._leftPinch.flag = true;
        this.modeManager.currentMode.handlePinchStart(this.leftHandEntity);
      }
      else if (this._leftPinch.isUnselected(leftCurrentPose) && this._leftPinch.flag) {
        // console.log('Left hand pinch ended');
        this._leftPinch.flag = false;
        this.modeManager.currentMode.handlePinchEnd(this.leftHandEntity);
      }

      if (this._leftLock.isSelected(leftCurrentPose) && !this._leftLock.flag) {
        // console.log('Left hand lock started');
        this._leftLock.flag = true;
        this.modeManager.currentMode.handleLockStart(this.leftHandEntity);
      }
      else if (!this._leftLock.isSelected(leftCurrentPose) && this._leftLock.flag) {
        // console.log('Left hand lock ended');
        this._leftLock.flag = false;
        this.modeManager.currentMode.handleLockEnd(this.leftHandEntity);
      }
    }
    if (this.rightHandPose) {
      const rightCurrentPose = this.rightHandPose.currentPose;
      const rightPreviousPose = this.rightHandPose.previousPose;
      if (!rightCurrentPose || !rightPreviousPose) return;

      if (this._rightGrab.isSelected(rightCurrentPose) && !this._rightGrab.flag) {
        // console.log('Right hand grab started');
        this._rightGrab.flag = true;
        this.modeManager.currentMode.handleGrabStart(this.rightHandEntity);
      }
      else if (!this._rightGrab.isSelected(rightCurrentPose) && this._rightGrab.flag) {
        // console.log('Right hand grab ended');
        this._rightGrab.flag = false;
        this.modeManager.currentMode.handleGrabEnd(this.rightHandEntity);
      }

      if (this._rightPinch.isSelected(rightCurrentPose) && !this._rightPinch.flag) {
        // console.log('Right hand pinch started');
        this._rightPinch.flag = true;
        this.modeManager.currentMode.handlePinchStart(this.rightHandEntity);
      }
      else if (this._rightPinch.isUnselected(rightCurrentPose) && this._rightPinch.flag) {
        // console.log('Right hand pinch ended');
        this._rightPinch.flag = false;
        this.modeManager.currentMode.handlePinchEnd(this.rightHandEntity);
      }

      if (this._rightLock.isSelected(rightCurrentPose) && !this._rightLock.flag) {
        // console.log('Right hand lock started');
        this._rightLock.flag = true;
        this.modeManager.currentMode.handleLockStart(this.rightHandEntity);
      }
      else if (!this._rightLock.isSelected(rightCurrentPose) && this._rightLock.flag) {
        // console.log('Right hand lock ended');
        this._rightLock.flag = false;
        this.modeManager.currentMode.handleLockEnd(this.rightHandEntity);
      }
    }

    if (this.modeManager.currentMode) {
      this.el.sceneEl.object3D.updateMatrixWorld(true);
      this.modeManager.currentMode.execute();
    }
  },

  remove: function () { },

  isLocked: function (handEntity) {
    if (handEntity == this.leftHandEntity) {
      return this._leftLock.flag;
    } else {
      return this._rightLock.flag;
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
