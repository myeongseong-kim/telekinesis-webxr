import { Mode } from './mode.js';

export class BiManualMode extends Mode {
  constructor(context) {
    super(context);
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

    this.updatePlaneTransform();
  }

  exit() {
    super.exit();

    this.context.planeEntity.setAttribute('visible', 'false');
    this.initPlaneTransform();

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);
  }

  handlePinchMove(handEntity) {
    super.handlePinchMove(handEntity);
  }

  handlePinchEnd(handEntity) {
    super.handlePinchEnd(handEntity);

    var toMode = this.context.modeManager.modes['UniManual'];

    var handedness = handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      toMode.handEntity = this.rightHandEntity;
    } else if (handedness == 'right') {
      toMode.handEntity = this.leftHandEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(toMode);
  }

  updatePlaneTransform() {
    var leftHandData = this.leftHandEntity.components['hand-tracking-controls'];
    var rightHandData = this.rightHandEntity.components['hand-tracking-controls'];

    var leftPinchPos = new THREE.Vector3().copy(leftHandData.pinchEventDetail.position);
    var leftPinchRot = new THREE.Quaternion().copy(leftHandData.pinchEventDetail.wristRotation);

    var rightPinchPos = new THREE.Vector3().copy(rightHandData.pinchEventDetail.position);
    var rightPinchRot = new THREE.Quaternion().copy(rightHandData.pinchEventDetail.wristRotation);

    var leftPinchRight = new THREE.Vector3();
    var leftPinchUp = new THREE.Vector3();
    var leftPinchForward = new THREE.Vector3();
    var leftPinchRotationMatrix = new THREE.Matrix4();
    leftPinchRotationMatrix.makeRotationFromQuaternion(leftPinchRot);
    leftPinchRotationMatrix.extractBasis(leftPinchRight, leftPinchUp, leftPinchForward);

    var rightPinchRight = new THREE.Vector3();
    var rightPinchUp = new THREE.Vector3();
    var rightPinchForward = new THREE.Vector3();
    var rightPinchRotationMatrix = new THREE.Matrix4();
    rightPinchRotationMatrix.makeRotationFromQuaternion(rightPinchRot);
    rightPinchRotationMatrix.extractBasis(rightPinchRight, rightPinchUp, rightPinchForward);

    // up
    let leftPlaneNormal = leftPinchRight.clone();
    let rightPlaneNormal = rightPinchRight.clone().negate();
    let planeUp = new THREE.Vector3().lerpVectors(leftPlaneNormal, rightPlaneNormal, 0.5).normalize();

    // forward
    let planeForward = new THREE.Vector3().lerpVectors(leftPinchForward, rightPinchForward, 0.5).normalize();
    planeForward.projectOnPlane(planeUp).normalize();

    //right
    let planeRight = new THREE.Vector3().crossVectors(planeUp, planeForward).normalize();

    var planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    var planePos = new THREE.Vector3().lerpVectors(leftPinchPos, rightPinchPos, 0.5);
    var planeRot = new THREE.Quaternion().setFromRotationMatrix(planeRotationMatrix);

    const planeObj = this.context.planeEntity.object3D;
    planeObj.position.copy(planePos);
    planeObj.quaternion.copy(planeRot);
    planeObj.updateMatrixWorld(true);
  }

  initPlaneTransform() {
    const planeObj = this.context.planeEntity.object3D;
    planeObj.position.set(0, 0, 0);
    planeObj.rotation.set(0, 0, 0);
    planeObj.updateMatrixWorld(true);
  }
}
