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

    const planeObj = this.context.planeEntity.object3D;
    const targetObj = this.context.targetEntity.object3D;

    let prePlaneWorldPos = new THREE.Vector3();
    let prePlnaeWorldRot = new THREE.Quaternion();
    planeObj.getWorldPosition(prePlaneWorldPos);
    planeObj.getWorldQuaternion(prePlnaeWorldRot);

    this.updatePlaneTransform();

    let curPlaneWorldPos = new THREE.Vector3();
    let curPlaneWorldRot = new THREE.Quaternion();
    planeObj.getWorldPosition(curPlaneWorldPos);
    planeObj.getWorldQuaternion(curPlaneWorldRot);

    let deltaPos = new THREE.Vector3().subVectors(curPlaneWorldPos, prePlaneWorldPos);
    let deltaRot = new THREE.Quaternion().multiplyQuaternions(curPlaneWorldRot, prePlnaeWorldRot.clone().invert());

    let targetWorldPos = new THREE.Vector3();
    let targetWorldRot = new THREE.Quaternion();
    targetObj.getWorldPosition(targetWorldPos);
    targetObj.getWorldQuaternion(targetWorldRot);

    let newTargetWorldPos = new THREE.Vector3().addVectors(targetWorldPos, deltaPos);
    let newTargetWorldRot = new THREE.Quaternion().multiplyQuaternions(deltaRot, targetWorldRot);
    let newTargetWorldTransform = new THREE.Matrix4().compose(
      newTargetWorldPos,
      newTargetWorldRot,
      new THREE.Vector3(1, 1, 1)
    );

    let newTargetLocalPos = new THREE.Vector3();
    let newTargetLocalRot = new THREE.Quaternion();
    let newTargetLocalTransform = newTargetWorldTransform.clone();
    if (targetObj.parent) {
      targetObj.parent.updateMatrixWorld(true);
      let inverseParentTransform = targetObj.parent.matrixWorld.clone().invert();
      newTargetLocalTransform.premultiply(inverseParentTransform);
    }
    let tempLocalScl = new THREE.Vector3();
    newTargetLocalTransform.decompose(newTargetLocalPos, newTargetLocalRot, tempLocalScl);

    targetObj.position.copy(newTargetLocalPos);
    targetObj.quaternion.copy(newTargetLocalRot);
    targetObj.updateMatrixWorld(true);
  }

  exit() {
    super.exit();

    this.context.planeEntity.setAttribute('visible', 'false');
    this.initPlaneTransform();

    this.handEntity = null;
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);

    let toMode = this.context.modeManager.modes['BiManual'];

    const exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    const newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

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

    let toMode = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(toMode);
  }

  updatePlaneTransform() {
    const handData = this.handEntity.components['hand-tracking-controls'];
    const handedness = handData.data.hand;

    let pinchPos = new THREE.Vector3().copy(handData.pinchEventDetail.position);
    let pinchRot = new THREE.Quaternion().copy(handData.pinchEventDetail.wristRotation);

    let pinchUp = new THREE.Vector3();
    let pinchRight = new THREE.Vector3();
    let pinchForward = new THREE.Vector3();

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

    let planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    let planePos = pinchPos.clone();
    let planeRot = new THREE.Quaternion().setFromRotationMatrix(planeRotationMatrix);

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
