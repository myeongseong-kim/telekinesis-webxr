import { Mode } from '../../mode.js';
import { setWorldTransform, decomposeSwingTwist } from '../manipulator.js';

export class BiRotateMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiRotate';

    this.pivotHandEntity = null;
    this.handleHandEntity = null;

    this._currentPivotInteractorPos = null;
    this._currentPivotInteractorRot = null;
    this._previousPivotInteractorPos = null;
    this._previousPivotInteractorRot = null;

    this._currentHandleInteractorPos = null;
    this._currentHandleInteractorRot = null;
    this._previousHandleInteractorPos = null;
    this._previousHandleInteractorRot = null;
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

    let deltaPos = new THREE.Vector3(0, 0, 0);
    let deltaRot = new THREE.Quaternion().multiplyQuaternions(curIndicatorRot, preIndicatorRot.clone().invert());

    deltaPos.multiplyScalar(this.context.sensitivity);
    deltaRot.slerp(new THREE.Quaternion().identity(), 1.0 - this.context.sensitivity);

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

    this._currentPivotInteractorPos = null;
    this._currentPivotInteractorRot = null;
    this._previousPivotInteractorPos = null;
    this._previousPivotInteractorRot = null;

    this._currentHandleInteractorPos = null;
    this._currentHandleInteractorRot = null;
    this._previousHandleInteractorPos = null;
    this._previousHandleInteractorRot = null;
  }

  handleGrabStart(handEntity) { }

  handleGrabEnd(handEntity) { }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) {
    const oppositeHandEntity = this.getOppositeHandEntity(handEntity);

    if (this.context.isLocked(oppositeHandEntity)) {
      let modeTo = this.context.modeManager.modes['UniTranslate'];
      modeTo.handEntity = oppositeHandEntity;

      this.context.modeManager.transitTo(modeTo);
    }
    else {
      let modeTo = this.context.modeManager.modes['UniManipulate'];
      modeTo.handEntity = oppositeHandEntity;

      this.context.modeManager.transitTo(modeTo);
    }
  }

  handleLockStart(handEntity) {
    const oppositeHandEntity = this.getOppositeHandEntity(handEntity);

    let modeTo = this.context.modeManager.modes['BiTranslate'];

    let handedness = handEntity.components['hand-tracking-controls'].data.hand;
    let oppositeHandedness = oppositeHandEntity.components['hand-tracking-controls'].data.hand;

    if (handedness == 'left' && oppositeHandedness == 'right') {
      modeTo.leftHandEntity = handEntity;
      modeTo.rightHandEntity = oppositeHandEntity;
    } else if (handedness == 'right' && oppositeHandedness == 'left') {
      modeTo.leftHandEntity = oppositeHandEntity;
      modeTo.rightHandEntity = handEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(modeTo);
  }

  handleLockEnd(handEntity) {
    const oppositeHandEntity = this.getOppositeHandEntity(handEntity);

    if (this.context.isLocked(oppositeHandEntity)) {
      let modeTo = this.context.modeManager.modes['BiRotate'];
      modeTo.pivotHandEntity = oppositeHandEntity;
      modeTo.handleHandEntity = handEntity;

      this.context.modeManager.transitTo(modeTo);
    }
    else {
      let modeTo = this.context.modeManager.modes['BiManipulate'];

      let handedness = handEntity.components['hand-tracking-controls'].data.hand;
      let oppositeHandedness = oppositeHandEntity.components['hand-tracking-controls'].data.hand;

      if (handedness == 'left' && oppositeHandedness == 'right') {
        modeTo.leftHandEntity = handEntity;
        modeTo.rightHandEntity = oppositeHandEntity;
      } else if (handedness == 'right' && oppositeHandedness == 'left') {
        modeTo.leftHandEntity = oppositeHandEntity;
        modeTo.rightHandEntity = handEntity;
      } else {
        console.error('Hand Tracking Goes Wrong...');
      }

      this.context.modeManager.transitTo(modeTo);
    }
  }

  initSphereTransform() {
    let pivotInteractorRight = new THREE.Vector3();
    let pivotInteractorUp = new THREE.Vector3();
    let pivotInteractorForward = new THREE.Vector3();
    let pivotInteractorRotationMatrix = new THREE.Matrix4();
    pivotInteractorRotationMatrix.makeRotationFromQuaternion(this._currentPivotInteractorRot);
    pivotInteractorRotationMatrix.extractBasis(pivotInteractorRight, pivotInteractorUp, pivotInteractorForward);

    let handleInteractorRight = new THREE.Vector3();
    let handleInteractorUp = new THREE.Vector3();
    let handleInteractorForward = new THREE.Vector3();
    let handleInteractorRotationMatrix = new THREE.Matrix4();
    handleInteractorRotationMatrix.makeRotationFromQuaternion(this._currentHandleInteractorRot);
    handleInteractorRotationMatrix.extractBasis(handleInteractorRight, handleInteractorUp, handleInteractorForward);

    // center
    let sphereCenter = this._currentPivotInteractorPos.clone();

    // right
    let sphereRight = new THREE.Vector3().subVectors(
      this._currentHandleInteractorPos, this._currentPivotInteractorPos).normalize();

    // up
    let sphereUp = new THREE.Vector3(0, 1, 0);
    sphereUp.projectOnPlane(sphereRight).normalize();

    // forward
    let sphereForward = new THREE.Vector3().crossVectors(sphereRight, sphereUp).normalize();

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
    let pivotInteractorRight = new THREE.Vector3();
    let pivotInteractorUp = new THREE.Vector3();
    let pivotInteractorForward = new THREE.Vector3();
    let pivotInteractorRotationMatrix = new THREE.Matrix4();
    pivotInteractorRotationMatrix.makeRotationFromQuaternion(this._currentPivotInteractorRot);
    pivotInteractorRotationMatrix.extractBasis(pivotInteractorRight, pivotInteractorUp, pivotInteractorForward);

    let handleInteractorRight = new THREE.Vector3();
    let handleInteractorUp = new THREE.Vector3();
    let handleInteractorForward = new THREE.Vector3();
    let handleInteractorRotationMatrix = new THREE.Matrix4();
    handleInteractorRotationMatrix.makeRotationFromQuaternion(this._currentHandleInteractorRot);
    handleInteractorRotationMatrix.extractBasis(handleInteractorRight, handleInteractorUp, handleInteractorForward);

    // center
    let sphereCenter = this._currentPivotInteractorPos.clone();

    // bar
    let sphereBar = new THREE.Vector3().subVectors(
      this._currentHandleInteractorPos, this._currentPivotInteractorPos).normalize();

    const sphereObj = this.context.sphereEntity.object3D;
    let sphereObjPos = new THREE.Vector3();
    let sphereObjRot = new THREE.Quaternion();
    let sphereObjScl = new THREE.Vector3();
    sphereObj.getWorldPosition(sphereObjPos);
    sphereObj.getWorldQuaternion(sphereObjRot);
    sphereObj.getWorldScale(sphereObjScl);

    let spherical = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3().setFromMatrixColumn(sphereObj.matrixWorld, 0),
      sphereBar
    );

    let deltaRotHandle = new THREE.Quaternion().multiplyQuaternions(
      this._currentHandleInteractorRot,
      this._previousHandleInteractorRot.clone().invert()
    )
    let swing = new THREE.Quaternion();
    let twist = new THREE.Quaternion();
    decomposeSwingTwist(deltaRotHandle, sphereBar, swing, twist);

    let deltaPos = new THREE.Vector3().subVectors(
      sphereCenter,
      sphereObjPos
    );
    let deltaRot = new THREE.Quaternion().multiplyQuaternions(
      twist,
      spherical
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
    const pivotHandPose = this.pivotHandEntity.components['hand-pose-controls'];
    const handleHandPose = this.handleHandEntity.components['hand-pose-controls'];

    if (this._currentPivotInteractorPos != null && this._currentPivotInteractorRot != null) {
      this._previousPivotInteractorPos = this._currentPivotInteractorPos.clone();
      this._previousPivotInteractorRot = this._currentPivotInteractorRot.clone();
    }
    if (this._currentHandleInteractorPos != null && this._currentHandleInteractorRot != null) {
      this._previousHandleInteractorPos = this._currentHandleInteractorPos.clone();
      this._previousHandleInteractorRot = this._currentHandleInteractorRot.clone();
    }

    this._currentPivotInteractorPos = new THREE.Vector3().copy(pivotHandPose.getPointerPosition());
    this._currentPivotInteractorRot = new THREE.Quaternion().copy(pivotHandPose.getRootRotation());
    this._currentHandleInteractorPos = new THREE.Vector3().copy(handleHandPose.getPointerPosition());
    this._currentHandleInteractorRot = new THREE.Quaternion().copy(handleHandPose.getRootRotation());
  }

  getOppositeHandEntity(handEntity) {
    if (handEntity == this.pivotHandEntity) {
      return this.handleHandEntity;
    } else {
      return this.pivotHandEntity;
    }
  }
}
