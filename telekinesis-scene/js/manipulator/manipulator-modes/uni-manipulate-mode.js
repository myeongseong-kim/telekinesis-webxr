import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class UniManipulateMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'UniManipulate';

    this.handEntity = null;

    this._currentInteractorPos = null;
    this._currentInteractorRot = null;
    this._previousInteractorPos = null;
    this._previousInteractorRot = null;
  }

  enter() {
    super.enter();

    this.context.sphereEntity.setAttribute('visible', 'true');

    this.updateInteractors();
    this.initSphereTransform();
  }

  execute() {
    super.execute();

    const sphereObj = this.context.sphereEntity.object3D;
    const targetObj = this.context.targetEntity.object3D;

    let preIndicatorPos = new THREE.Vector3();
    let preIndicatorRot = new THREE.Quaternion();
    sphereObj.getWorldPosition(preIndicatorPos);
    sphereObj.getWorldQuaternion(preIndicatorRot);

    this.updateInteractors();
    this.updateSphereTransform();

    let curIndicatorPos = new THREE.Vector3();
    let curIndicatorRot = new THREE.Quaternion();
    sphereObj.getWorldPosition(curIndicatorPos);
    sphereObj.getWorldQuaternion(curIndicatorRot);

    let targetPos = new THREE.Vector3();
    let targetRot = new THREE.Quaternion();
    let targetScl = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);
    targetObj.getWorldQuaternion(targetRot);
    targetObj.getWorldScale(targetScl);

    let deltaPos = new THREE.Vector3().subVectors(curIndicatorPos, preIndicatorPos);
    let deltaRot = new THREE.Quaternion().multiplyQuaternions(curIndicatorRot, preIndicatorRot.clone().invert());

    let newTargetPos = new THREE.Vector3().addVectors(targetPos, deltaPos);
    let newTargetRot = new THREE.Quaternion().multiplyQuaternions(deltaRot, targetRot);
    let newTargetScl = new THREE.Vector3().copy(targetScl);

    setWorldTransform(
      targetObj,
      newTargetPos,
      newTargetRot,
      newTargetScl
    );
  }

  exit() {
    super.exit();

    this.context.sphereEntity.setAttribute('visible', 'false');
    const sphereObj = this.context.sphereEntity.object3D;
    sphereObj.position.set(0, 0, 0);
    sphereObj.rotation.set(0, 0, 0);
    sphereObj.updateMatrixWorld(true);

    this.handEntity = null;

    this._currentInteractorPos = null;
    this._currentInteractorRot = null;
    this._previousInteractorPos = null;
    this._previousInteractorRot = null;
  }

  handleGrabStart(handEntity) { }

  handleGrabEnd(handEntity) { }

  handlePinchStart(handEntity) {
    if (this.context.isLocked(handEntity)) {
      let modeTo = this.context.modeManager.modes['BiRotate'];
      modeTo.pivotHandEntity = handEntity;
      modeTo.handleHandEntity = this.handEntity;

      this.context.modeManager.transitTo(modeTo);
    }
    else {
      let modeTo = this.context.modeManager.modes['BiManipulate'];

      let exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
      let newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

      if (exHandedness == 'left' && newHandedness == 'right') {
        modeTo.leftHandEntity = this.handEntity;
        modeTo.rightHandEntity = handEntity;
      } else if (exHandedness == 'right' && newHandedness == 'left') {
        modeTo.leftHandEntity = handEntity;
        modeTo.rightHandEntity = this.handEntity;
      } else {
        console.error('Hand Tracking Goes Wrong...');
      }

      this.context.modeManager.transitTo(modeTo);
    }
  }

  handlePinchEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(modeTo);
  }

  handleLockStart(handEntity) {
    if (handEntity == this.handEntity) {
      let modeTo = this.context.modeManager.modes['UniTranslate'];
      modeTo.handEntity = handEntity;

      this.context.modeManager.transitTo(modeTo);
    }
  }

  handleLockEnd(handEntity) { }

  initSphereTransform() {
    let interactorUp = new THREE.Vector3();
    let interactorRight = new THREE.Vector3();
    let interactorForward = new THREE.Vector3();
    let interactorRotationMatrix = new THREE.Matrix4();
    interactorRotationMatrix.makeRotationFromQuaternion(this._currentInteractorRot);
    interactorRotationMatrix.extractBasis(interactorRight, interactorUp, interactorForward);

    // center
    let sphereCenter = this._currentInteractorPos.clone();

    // forward
    let sphereForward = interactorForward.clone();

    // up
    let sphereUp;
    let handedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      sphereUp = interactorRight.clone();
    } else {
      sphereUp = interactorRight.clone().negate();
    }

    // right
    let sphereRight = new THREE.Vector3().crossVectors(sphereUp, sphereForward).normalize();

    let sphereRotationMatrix = new THREE.Matrix4();
    sphereRotationMatrix.makeBasis(sphereRight, sphereUp, sphereForward);

    const sphereObj = this.context.sphereEntity.object3D;
    let pos = new THREE.Vector3().copy(sphereCenter);
    let rot = new THREE.Quaternion().setFromRotationMatrix(sphereRotationMatrix);
    let scl = sphereObj.getWorldScale(new THREE.Vector3());

    setWorldTransform(
      sphereObj,
      pos,
      rot,
      scl
    );
  }

  updateSphereTransform() {
    let interactorUp = new THREE.Vector3();
    let interactorRight = new THREE.Vector3();
    let interactorForward = new THREE.Vector3();
    let interactorRotationMatrix = new THREE.Matrix4();
    interactorRotationMatrix.makeRotationFromQuaternion(this._currentInteractorRot);
    interactorRotationMatrix.extractBasis(interactorRight, interactorUp, interactorForward);

    // center
    let sphereCenter = this._currentInteractorPos.clone();

    // forward
    let sphereForward = interactorForward.clone();

    // up
    let sphereUp;
    let handedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      sphereUp = interactorRight.clone();
    } else {
      sphereUp = interactorRight.clone().negate();
    }

    // right
    let sphereRight = new THREE.Vector3().crossVectors(sphereUp, sphereForward).normalize();

    const sphereObj = this.context.sphereEntity.object3D;
    let sphereObjPos = new THREE.Vector3();
    let sphereObjRot = new THREE.Quaternion();
    let sphereObjScl = new THREE.Vector3();
    sphereObj.getWorldPosition(sphereObjPos);
    sphereObj.getWorldQuaternion(sphereObjRot);
    sphereObj.getWorldScale(sphereObjScl);

    let sphereRotationMatrix = new THREE.Matrix4();
    sphereRotationMatrix.makeBasis(sphereRight, sphereUp, sphereForward);
    let sphereRot = new THREE.Quaternion().setFromRotationMatrix(sphereRotationMatrix);

    let deltaPos = new THREE.Vector3().subVectors(
      sphereCenter,
      sphereObjPos
    );
    let deltaRot = new THREE.Quaternion().multiplyQuaternions(
      sphereRot,
      sphereObjRot.clone().invert()
    );

    let pos = new THREE.Vector3().addVectors(sphereObjPos, deltaPos);
    let rot = new THREE.Quaternion().multiplyQuaternions(deltaRot, sphereObjRot);
    let scl = new THREE.Vector3().copy(sphereObjScl);

    setWorldTransform(
      sphereObj,
      pos,
      rot,
      scl
    );
  }

  updateInteractors() {
    const handPose = this.handEntity.components['hand-pose-controls'];

    if (this._currentInteractorPos != null && this._currentInteractorRot != null) {
      this._previousInteractorPos = this._currentInteractorPos.clone();
      this._previousInteractorRot = this._currentInteractorRot.clone();
    }

    this._currentInteractorPos = new THREE.Vector3().copy(handPose.getPointerPosition());
    this._currentInteractorRot = new THREE.Quaternion().copy(handPose.getRootRotation());
  }
}
