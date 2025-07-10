import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class BiManualMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiManual';

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  enter() {
    super.enter();

    this.context.planeEntity.setAttribute('visible', 'true');

    this.updatePlaneTransform();
  }

  execute() {
    super.execute();

    const planeObj = this.context.planeEntity.object3D;
    const targetObj = this.context.targetEntity.object3D;

    let preIndicatorPos = new THREE.Vector3();
    let preIndicatorRot = new THREE.Quaternion();
    planeObj.getWorldPosition(preIndicatorPos);
    planeObj.getWorldQuaternion(preIndicatorRot);

    this.updatePlaneTransform();

    let curIndicatorPos = new THREE.Vector3();
    let curIndicatorRot = new THREE.Quaternion();
    planeObj.getWorldPosition(curIndicatorPos);
    planeObj.getWorldQuaternion(curIndicatorRot);

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

    this.context.planeEntity.setAttribute('visible', 'false');
    const planeObj = this.context.planeEntity.object3D;
    planeObj.position.set(0, 0, 0);
    planeObj.rotation.set(0, 0, 0);
    planeObj.updateMatrixWorld(true);

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  handleGrabStart(handEntity) { }

  handleGrabEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['UniManual'];

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

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) { }

  handleLockStart(handEntity) { }

  handleLockEnd(handEntity) { }

  updatePlaneTransform() {
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

    // up
    let leftPlaneNormal = leftWristRight.clone();
    let rightPlaneNormal = rightWristRight.clone().negate();
    let planeUp = new THREE.Vector3().lerpVectors(leftPlaneNormal, rightPlaneNormal, 0.5).normalize();

    // forward
    let planeForward = new THREE.Vector3().lerpVectors(leftWristForward, rightWristForward, 0.5).normalize();
    planeForward.projectOnPlane(planeUp).normalize();

    // right
    let planeRight = new THREE.Vector3().crossVectors(planeUp, planeForward).normalize();

    let planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    let pos = new THREE.Vector3().lerpVectors(leftPointerPos, rightPointerPos, 0.5);
    let rot = new THREE.Quaternion().setFromRotationMatrix(planeRotationMatrix);
    let scl = new THREE.Vector3();

    const planeObj = this.context.planeEntity.object3D;
    planeObj.getWorldScale(scl);

    setWorldTransform(
      planeObj,
      pos,
      rot,
      scl
    );
  }
}
