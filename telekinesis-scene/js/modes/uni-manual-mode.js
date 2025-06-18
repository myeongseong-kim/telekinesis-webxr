import { Mode } from './mode.js';

export class UniManualMode extends Mode {
  constructor(context) {
    super(context);
    this.handEntity = null;
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

    this.handEntity = null;
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);

    var toMode = this.context.modeManager.modes['BiManual'];

    var exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    var newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

    if (exHandedness == 'left' && newHandedness == 'right') {
      toMode.leftHandEntity = this.handEntity;
      toMode.rightHandEntity = handEntity;
    } else if (exHandedness == 'right' && newHandedness == 'left') {
      toMode.leftHandEntity = handEntity;
      toMode.rightHandEntity = this.handEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(toMode);
  }

  handlePinchMove(handEntity) {
    super.handlePinchMove(handEntity);
  }

  handlePinchEnd(handEntity) {
    super.handlePinchEnd(handEntity);

    var toMode = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(toMode);
  }

  updatePlaneTransform() {
    var handData = this.handEntity.components['hand-tracking-controls'];
    var handedness = handData.data.hand;

    var pinchPos = new THREE.Vector3().copy(handData.pinchEventDetail.position);
    var pinchRot = new THREE.Quaternion().copy(handData.pinchEventDetail.wristRotation);

    var pinchUp = new THREE.Vector3();
    var pinchRight = new THREE.Vector3();
    var pinchForward = new THREE.Vector3();

    var pinchRotationMatrix = new THREE.Matrix4();
    pinchRotationMatrix.makeRotationFromQuaternion(pinchRot);
    pinchRotationMatrix.extractBasis(pinchRight, pinchUp, pinchForward);

    // up
    var planeUp;
    if (handedness == 'left') {
      planeUp = pinchRight.clone();
    } else {
      planeUp = pinchRight.clone().negate();
    }

    // forward
    var planeForward = pinchForward.clone();

    // right
    var planeRight = new THREE.Vector3().crossVectors(planeUp, planeForward);

    var planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    var planePos = pinchPos.clone();
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
