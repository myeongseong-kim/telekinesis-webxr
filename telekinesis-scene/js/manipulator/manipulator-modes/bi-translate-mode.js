import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class BiTranslateMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiTranslate';

    this.leftHandEntity = null;
    this.rightHandEntity = null;

    this._currentLeftInteractorPos = null;
    this._currentLeftInteractorRot = null;
    this._previousLeftInteractorPos = null;
    this._previousLeftInteractorRot = null;

    this._currentRightInteractorPos = null;
    this._currentRightInteractorRot = null;
    this._previousRightInteractorPos = null;
    this._previousRightInteractorRot = null;
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

    const cameraPos = new THREE.Vector3();
    this.context.el.sceneEl.camera.getWorldPosition(cameraPos);

    let distToIndicator = cameraPos.distanceTo(preIndicatorPos);
    let distToTarget = cameraPos.distanceTo(targetPos);
    let ratio = distToTarget / distToIndicator;

    let deltaPos = new THREE.Vector3().subVectors(curIndicatorPos, preIndicatorPos);
    deltaPos.multiplyScalar(ratio);
    let deltaRot = new THREE.Quaternion().identity();

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

    this._currentLeftInteractorPos = null;
    this._currentLeftInteractorRot = null;
    this._previousLeftInteractorPos = null;
    this._previousLeftInteractorRot = null;

    this._currentRightInteractorPos = null;
    this._currentRightInteractorRot = null;
    this._previousRightInteractorPos = null;
    this._previousRightInteractorRot = null;
  }

  handleGrabStart(handEntity) { }

  handleGrabEnd(handEntity) { }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['UniTranslate'];
    modeTo.handEntity = this.getOppositeHandEntity(handEntity);

    this.context.modeManager.transitTo(modeTo);
  }

  handleLockStart(handEntity) { }

  handleLockEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['BiRotate'];
    modeTo.pivotHandEntity = this.getOppositeHandEntity(handEntity);;
    modeTo.handleHandEntity = handEntity;

    this.context.modeManager.transitTo(modeTo);
  }

  initSphereTransform() {
    let leftInteractorRight = new THREE.Vector3();
    let leftInteractorUp = new THREE.Vector3();
    let leftInteractorForward = new THREE.Vector3();
    let leftInteractorRotationMatrix = new THREE.Matrix4();
    leftInteractorRotationMatrix.makeRotationFromQuaternion(this._currentLeftInteractorRot);
    leftInteractorRotationMatrix.extractBasis(leftInteractorRight, leftInteractorUp, leftInteractorForward);

    let rightInteractorRight = new THREE.Vector3();
    let rightInteractorUp = new THREE.Vector3();
    let rightInteractorForward = new THREE.Vector3();
    let rightInteractorRotationMatrix = new THREE.Matrix4();
    rightInteractorRotationMatrix.makeRotationFromQuaternion(this._currentRightInteractorRot);
    rightInteractorRotationMatrix.extractBasis(rightInteractorRight, rightInteractorUp, rightInteractorForward);

    // center
    let sphereCenter = new THREE.Vector3().lerpVectors(this._currentLeftInteractorPos, this._currentRightInteractorPos, 0.5);

    // right
    let sphereRight = new THREE.Vector3().subVectors(
      this._currentRightInteractorPos, this._currentLeftInteractorPos).normalize();

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
    let leftInteractorRight = new THREE.Vector3();
    let leftInteractorUp = new THREE.Vector3();
    let leftInteractorForward = new THREE.Vector3();
    let leftInteractorRotationMatrix = new THREE.Matrix4();
    leftInteractorRotationMatrix.makeRotationFromQuaternion(this._currentLeftInteractorRot);
    leftInteractorRotationMatrix.extractBasis(leftInteractorRight, leftInteractorUp, leftInteractorForward);

    let rightInteractorRight = new THREE.Vector3();
    let rightInteractorUp = new THREE.Vector3();
    let rightInteractorForward = new THREE.Vector3();
    let rightInteractorRotationMatrix = new THREE.Matrix4();
    rightInteractorRotationMatrix.makeRotationFromQuaternion(this._currentRightInteractorRot);
    rightInteractorRotationMatrix.extractBasis(rightInteractorRight, rightInteractorUp, rightInteractorForward);

    // center
    let sphereCenter = new THREE.Vector3().lerpVectors(this._currentLeftInteractorPos, this._currentRightInteractorPos, 0.5);

    const sphereObj = this.context.sphereEntity.object3D;
    let sphereObjPos = new THREE.Vector3();
    let sphereObjRot = new THREE.Quaternion();
    let sphereObjScl = new THREE.Vector3();
    sphereObj.getWorldPosition(sphereObjPos);
    sphereObj.getWorldQuaternion(sphereObjRot);
    sphereObj.getWorldScale(sphereObjScl);

    let deltaPos = new THREE.Vector3().subVectors(
      sphereCenter,
      sphereObjPos
    );
    let deltaRot = new THREE.Quaternion().identity();

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
    const leftHandPose = this.leftHandEntity.components['hand-pose-controls'];
    const rightHandPose = this.rightHandEntity.components['hand-pose-controls'];

    if (this._currentLeftInteractorPos != null && this._currentLeftInteractorRot != null) {
      this._previousLeftInteractorPos = this._currentLeftInteractorPos.clone();
      this._previousLeftInteractorRot = this._currentLeftInteractorRot.clone();
    }
    if (this._currentRightInteractorPos != null && this._currentRightInteractorRot != null) {
      this._previousRightInteractorPos = this._currentRightInteractorPos.clone();
      this._previousRightInteractorRot = this._currentRightInteractorRot.clone();
    }

    this._currentLeftInteractorPos = new THREE.Vector3().copy(leftHandPose.getPointerPosition());
    this._currentLeftInteractorRot = new THREE.Quaternion().copy(leftHandPose.getRootRotation());
    this._currentRightInteractorPos = new THREE.Vector3().copy(rightHandPose.getPointerPosition());
    this._currentRightInteractorRot = new THREE.Quaternion().copy(rightHandPose.getRootRotation());
  }

  getOppositeHandEntity(handEntity) {
    if (handEntity == this.leftHandEntity) {
      return this.rightHandEntity;
    } else {
      return this.leftHandEntity;
    }
  }
}
