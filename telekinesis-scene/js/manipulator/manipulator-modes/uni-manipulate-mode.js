import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class UniManipulateMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'UniManipulate';

    this.handEntity = null;
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

      const exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
      const newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

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
    const handPose = this.handEntity.components['hand-pose-controls'];
    const handedness = handPose.handedness;

    let pointerPos = new THREE.Vector3().copy(handPose.getPointerPosition());
    let wristRot = new THREE.Quaternion().copy(handPose.getRootRotation());

    let wristUp = new THREE.Vector3();
    let wristRight = new THREE.Vector3();
    let wristForward = new THREE.Vector3();
    let wristRotationMatrix = new THREE.Matrix4();
    wristRotationMatrix.makeRotationFromQuaternion(wristRot);
    wristRotationMatrix.extractBasis(wristRight, wristUp, wristForward);

    // up
    let sphereUp;
    if (handedness == 'left') {
      sphereUp = wristRight.clone();
    } else {
      sphereUp = wristRight.clone().negate();
    }

    // forward
    let sphereForward = wristForward.clone();

    // right
    let sphereRight = new THREE.Vector3().crossVectors(sphereUp, sphereForward).normalize();

    let sphereRotationMatrix = new THREE.Matrix4();
    sphereRotationMatrix.makeBasis(sphereRight, sphereUp, sphereForward);

    const sphereObj = this.context.sphereEntity.object3D;
    let pos = pointerPos.clone();
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
    const handPose = this.handEntity.components['hand-pose-controls'];
    const handedness = handPose.handedness;

    let pointerPos = new THREE.Vector3().copy(handPose.getPointerPosition());
    let wristRot = new THREE.Quaternion().copy(handPose.getRootRotation());

    let wristUp = new THREE.Vector3();
    let wristRight = new THREE.Vector3();
    let wristForward = new THREE.Vector3();
    let wristRotationMatrix = new THREE.Matrix4();
    wristRotationMatrix.makeRotationFromQuaternion(wristRot);
    wristRotationMatrix.extractBasis(wristRight, wristUp, wristForward);

    // up
    let sphereUp;
    if (handedness == 'left') {
      sphereUp = wristRight.clone();
    } else {
      sphereUp = wristRight.clone().negate();
    }

    // forward
    let sphereForward = wristForward.clone();

    // right
    let sphereRight = new THREE.Vector3().crossVectors(sphereUp, sphereForward).normalize();

    // rotation
    let sphereRotationMatrix = new THREE.Matrix4();
    sphereRotationMatrix.makeBasis(sphereRight, sphereUp, sphereForward);
    let sphereRot = new THREE.Quaternion().setFromRotationMatrix(sphereRotationMatrix);

    const sphereObj = this.context.sphereEntity.object3D;
    let sphereObjPos = new THREE.Vector3();
    let sphereObjRot = new THREE.Quaternion();
    let sphereObjScl = new THREE.Vector3();
    sphereObj.getWorldPosition(sphereObjPos);
    sphereObj.getWorldQuaternion(sphereObjRot);
    sphereObj.getWorldScale(sphereObjScl);

    let deltaPos = new THREE.Vector3().subVectors(
      pointerPos,
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
}
