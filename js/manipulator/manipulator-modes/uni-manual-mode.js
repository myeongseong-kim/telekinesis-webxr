import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class UniManualMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'UniManual';

    this.handEntity = null;
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

    this.handEntity = null;
  }

  handleGrabStart(handEntity) {
    let modeTo = this.context.modeManager.modes['BiManual'];

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

  handleGrabEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(modeTo);
  }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) { }

  handleLockStart(handEntity) { }

  handleLockEnd(handEntity) { }

  updatePlaneTransform() {
    const handPose = this.handEntity.components['hand-pose-controls'];
    let interactorPos = new THREE.Vector3().copy(handPose.getPointerPosition());
    let interactorRot = new THREE.Quaternion().copy(handPose.getRootRotation());

    let interactorUp = new THREE.Vector3();
    let interactorRight = new THREE.Vector3();
    let interactorForward = new THREE.Vector3();
    let interactorRotationMatrix = new THREE.Matrix4();
    interactorRotationMatrix.makeRotationFromQuaternion(interactorRot);
    interactorRotationMatrix.extractBasis(interactorRight, interactorUp, interactorForward);

    // center
    let planeCenter = interactorPos.clone();

    // up
    let planeUp;
    let handedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      planeUp = interactorRight.clone();
    } else {
      planeUp = interactorRight.clone().negate();
    }

    // forward
    let planeForward = interactorForward.clone();

    // right
    let planeRight = new THREE.Vector3().crossVectors(planeUp, planeForward);

    let planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    let pos = new THREE.Vector3().copy(planeCenter);
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
