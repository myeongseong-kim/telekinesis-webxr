import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class BiRotateMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiRotate';

    this.pivotHandEntity = null;
    this.handleHandEntity = null;
  }

  enter() {
    super.enter();

    this.context.sphereEntity.setAttribute('visible', 'true');

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
    const pivotHandPose = this.pivotHandEntity.components['hand-pose-controls'];
    const handleHandPose = this.handleHandEntity.components['hand-pose-controls'];

    let pivotPointerPos = new THREE.Vector3().copy(pivotHandPose.getPointerPosition());
    let pivotWristRot = new THREE.Quaternion().copy(pivotHandPose.getRootRotation());

    let handlePointerPos = new THREE.Vector3().copy(handleHandPose.getPointerPosition());
    let handleWristRot = new THREE.Quaternion().copy(handleHandPose.getRootRotation());

    let pivotWristRight = new THREE.Vector3();
    let pivotWristUp = new THREE.Vector3();
    let pivotWristForward = new THREE.Vector3();
    let pivotWristRotationMatrix = new THREE.Matrix4();
    pivotWristRotationMatrix.makeRotationFromQuaternion(pivotWristRot);
    pivotWristRotationMatrix.extractBasis(pivotWristRight, pivotWristUp, pivotWristForward);

    let handleWristRight = new THREE.Vector3();
    let handleWristUp = new THREE.Vector3();
    let handleWristForward = new THREE.Vector3();
    let handleWristRotationMatrix = new THREE.Matrix4();
    handleWristRotationMatrix.makeRotationFromQuaternion(handleWristRot);
    handleWristRotationMatrix.extractBasis(handleWristRight, handleWristUp, handleWristForward);

    // right
    let sphereRight = new THREE.Vector3().subVectors(handlePointerPos, pivotPointerPos).normalize();

    // up
    let sphereUp = new THREE.Vector3(0, 1, 0);
    sphereUp.projectOnPlane(sphereRight).normalize();

    // forward
    let sphereForward = new THREE.Vector3().crossVectors(sphereRight, sphereUp).normalize();

    let sphereRotationMatrix = new THREE.Matrix4();
    sphereRotationMatrix.makeBasis(sphereRight, sphereUp, sphereForward);

    const sphereObj = this.context.sphereEntity.object3D;
    let pos = new THREE.Vector3().copy(pivotPointerPos);
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
    const pivotHandPose = this.pivotHandEntity.components['hand-pose-controls'];
    const handleHandPose = this.handleHandEntity.components['hand-pose-controls'];

    let pivotPointerPos = new THREE.Vector3().copy(pivotHandPose.getPointerPosition());
    let pivotWristRot = new THREE.Quaternion().copy(pivotHandPose.getRootRotation());

    let handlePointerPos = new THREE.Vector3().copy(handleHandPose.getPointerPosition());
    let handleWristRot = new THREE.Quaternion().copy(handleHandPose.getRootRotation());

    let pivotWristRight = new THREE.Vector3();
    let pivotWristUp = new THREE.Vector3();
    let pivotWristForward = new THREE.Vector3();
    let pivotWristRotationMatrix = new THREE.Matrix4();
    pivotWristRotationMatrix.makeRotationFromQuaternion(pivotWristRot);
    pivotWristRotationMatrix.extractBasis(pivotWristRight, pivotWristUp, pivotWristForward);

    let handleWristRight = new THREE.Vector3();
    let handleWristUp = new THREE.Vector3();
    let handleWristForward = new THREE.Vector3();
    let handleWristRotationMatrix = new THREE.Matrix4();
    handleWristRotationMatrix.makeRotationFromQuaternion(handleWristRot);
    handleWristRotationMatrix.extractBasis(handleWristRight, handleWristUp, handleWristForward);

    // right
    let sphereRight = new THREE.Vector3().subVectors(handlePointerPos, pivotPointerPos).normalize();

    const sphereObj = this.context.sphereEntity.object3D;
    let sphereObjPos = new THREE.Vector3();
    let sphereObjRot = new THREE.Quaternion();
    let sphereObjScl = new THREE.Vector3();
    sphereObj.getWorldPosition(sphereObjPos);
    sphereObj.getWorldQuaternion(sphereObjRot);
    sphereObj.getWorldScale(sphereObjScl);

    let deltaPos = new THREE.Vector3().subVectors(
      pivotPointerPos,
      sphereObjPos
    );
    let deltaRot = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3().setFromMatrixColumn(sphereObj.matrixWorld, 0),
      sphereRight
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

  getOppositeHandEntity(handEntity) {
    if (handEntity == this.pivotHandEntity) {
      return this.handleHandEntity;
    } else {
      return this.pivotHandEntity;
    }
  }
}
