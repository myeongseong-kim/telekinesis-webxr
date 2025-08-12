import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class ScaleMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'Scale';

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

    this._scale = 1.0;
    this.UNIT = 0.1;
    this.MAX_SCALE = 1.0;
    this.MIN_SCALE = 0.1;

    this._initialLenght = 0;
    this._currentLenght = 0;
  }

  enter() {
    super.enter();

    this.context.sphereEntity.setAttribute('visible', 'true');

    this.updateInteractors();
    this.initSphereTransform();

    this._scale = this.context.sensitivity;
    this._initialLenght = this.getDistanceBetweenHands();
  }

  execute() {
    super.execute();

    this.updateInteractors();
    this.updateSphereTransform();

    this._currentLenght = this.getDistanceBetweenHands();
    let value = this._currentLenght / this._initialLenght;

    this.context.sensitivity = Math.round(value * this._scale / this.UNIT) * this.UNIT;
    if (this.context.sensitivity < this.MIN_SCALE) {
      this.context.sensitivity = this.MIN_SCALE;
    }
    else if (this.context.sensitivity > this.MAX_SCALE) {
      this.context.sensitivity = this.MAX_SCALE;
    }
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

  handleGrabEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['Ready'];

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

    // bar
    let sphereBar = new THREE.Vector3().subVectors(
      this._currentRightInteractorPos, this._currentLeftInteractorPos).normalize();

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

  getDistanceBetweenHands() {
    if (this._currentLeftInteractorPos && this._currentRightInteractorPos) {
      return this._currentLeftInteractorPos.distanceTo(this._currentRightInteractorPos);
    }
    return 0;
  }
}
