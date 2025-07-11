import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class BiManipulateMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiManipulate';

    this.leftHandEntity = null;
    this.rightHandEntity = null;
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

    let deltaPos = new THREE.Vector3().subVectors(curIndicatorPos, preIndicatorPos);
    let deltaRot = new THREE.Quaternion().multiplyQuaternions(curIndicatorRot, preIndicatorRot.clone().invert());

    let targetPos = new THREE.Vector3();
    let targetRot = new THREE.Quaternion();
    let targetScl = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);
    targetObj.getWorldQuaternion(targetRot);
    targetObj.getWorldScale(targetScl);

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

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  handleGrabStart(handEntity) { }

  handleGrabEnd(handEntity) { }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['UniManipulate'];

    const handedness = handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      modeTo.handEntity = this.rightHandEntity;
    } else if (handedness == 'right') {
      modeTo.handEntity = this.leftHandEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(modeTo);
  }

  handleLockStart(handEntity) { 
    let modeTo = this.context.modeManager.modes['BiRotate'];
    modeTo.pivotHandEntity = handEntity;
    modeTo.handleHandEntity = this.getOppositeHandEntity(handEntity);

    this.context.modeManager.transitTo(modeTo);
  }

  handleLockEnd(handEntity) { }

  initSphereTransform() {
    const leftHandPose = this.leftHandEntity.components['hand-pose-controls'];
    const rightHandPose = this.rightHandEntity.components['hand-pose-controls'];

    let leftPointerPos = new THREE.Vector3().copy(leftHandPose.getPointerPosition());
    let leftWristRot = new THREE.Quaternion().copy(leftHandPose.getRootRotation());

    let rightPointerPos = new THREE.Vector3().copy(rightHandPose.getPointerPosition());
    let rightWristRot = new THREE.Quaternion().copy(rightHandPose.getRootRotation());

    let leftWristRight = new THREE.Vector3();
    let leftWristUp = new THREE.Vector3();
    let leftWristForward = new THREE.Vector3();
    let leftWristRotationMatrix = new THREE.Matrix4();
    leftWristRotationMatrix.makeRotationFromQuaternion(leftWristRot);
    leftWristRotationMatrix.extractBasis(leftWristRight, leftWristUp, leftWristForward);

    let rightWristRight = new THREE.Vector3();
    let rightWristUp = new THREE.Vector3();
    let rightWristForward = new THREE.Vector3();
    let rightWristRotationMatrix = new THREE.Matrix4();
    rightWristRotationMatrix.makeRotationFromQuaternion(rightWristRot);
    rightWristRotationMatrix.extractBasis(rightWristRight, rightWristUp, rightWristForward);

    // right
    let sphereRight = new THREE.Vector3().subVectors(rightPointerPos, leftPointerPos).normalize();

    // up
    let sphereUp = new THREE.Vector3(0, 1, 0);
    sphereUp.projectOnPlane(sphereRight).normalize();

    // forward
    let sphereForward = new THREE.Vector3().crossVectors(sphereRight, sphereUp).normalize();

    let sphereRotationMatrix = new THREE.Matrix4();
    sphereRotationMatrix.makeBasis(sphereRight, sphereUp, sphereForward);

    const sphereObj = this.context.sphereEntity.object3D;
    let pos = new THREE.Vector3().lerpVectors(leftPointerPos, rightPointerPos, 0.5);
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
    const leftHandPose = this.leftHandEntity.components['hand-pose-controls'];
    const rightHandPose = this.rightHandEntity.components['hand-pose-controls'];

    let leftPointerPos = new THREE.Vector3().copy(leftHandPose.getPointerPosition());
    let leftWristRot = new THREE.Quaternion().copy(leftHandPose.getRootRotation());

    let rightPointerPos = new THREE.Vector3().copy(rightHandPose.getPointerPosition());
    let rightWristRot = new THREE.Quaternion().copy(rightHandPose.getRootRotation());

    let leftWristRight = new THREE.Vector3();
    let leftWristUp = new THREE.Vector3();
    let leftWristForward = new THREE.Vector3();
    let leftWristRotationMatrix = new THREE.Matrix4();
    leftWristRotationMatrix.makeRotationFromQuaternion(leftWristRot);
    leftWristRotationMatrix.extractBasis(leftWristRight, leftWristUp, leftWristForward);

    let rightWristRight = new THREE.Vector3();
    let rightWristUp = new THREE.Vector3();
    let rightWristForward = new THREE.Vector3();
    let rightWristRotationMatrix = new THREE.Matrix4();
    rightWristRotationMatrix.makeRotationFromQuaternion(rightWristRot);
    rightWristRotationMatrix.extractBasis(rightWristRight, rightWristUp, rightWristForward);

    // right
    let sphereRight = new THREE.Vector3().subVectors(rightPointerPos, leftPointerPos).normalize();

    const sphereObj = this.context.sphereEntity.object3D;
    let sphereObjPos = new THREE.Vector3();
    let sphereObjRot = new THREE.Quaternion();
    let sphereObjScl = new THREE.Vector3();
    sphereObj.getWorldPosition(sphereObjPos);
    sphereObj.getWorldQuaternion(sphereObjRot);
    sphereObj.getWorldScale(sphereObjScl);

    let deltaPos = new THREE.Vector3().subVectors(
      new THREE.Vector3().lerpVectors(leftPointerPos, rightPointerPos, 0.5),
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
    if (handEntity == this.leftHandEntity) {
      return this.rightHandEntity;
    } else {
      return this.leftHandEntity;
    }
  }
}
