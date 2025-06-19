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
    let newTargetWorldTransform = new THREE.Matrix4().compose(newTargetWorldPos, newTargetWorldRot, new THREE.Vector3(1, 1, 1));
    
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

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);
  }
  handlePinchMove(handEntity) {
    super.handlePinchMove(handEntity)
  }
  handlePinchEnd(handEntity) {
    super.handlePinchEnd(handEntity);

    let toMode = this.context.modeManager.modes['UniManual'];

    const handedness = handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
        toMode.handEntity = this.rightHandEntity;
    }
    else if (handedness == 'right') {
        toMode.handEntity = this.leftHandEntity;
    }
    else {
        console.error("Hand Tracking Goes Wrong...");
    }

    this.context.modeManager.transitTo(toMode);
  }


  updatePlaneTransform() {
    const leftHandData = this.leftHandEntity.components['hand-tracking-controls'];
    const rightHandData = this.rightHandEntity.components['hand-tracking-controls'];

    let leftPinchPos = new THREE.Vector3().copy(leftHandData.pinchEventDetail.position);
    let leftPinchRot = new THREE.Quaternion().copy(leftHandData.pinchEventDetail.wristRotation);
    let rightPinchPos = new THREE.Vector3().copy(rightHandData.pinchEventDetail.position);
    let rightPinchRot = new THREE.Quaternion().copy(rightHandData.pinchEventDetail.wristRotation);

    let leftPinchRight = new THREE.Vector3();
    let leftPinchUp = new THREE.Vector3();
    let leftPinchForward = new THREE.Vector3();
    let leftPinchRotationMatrix = new THREE.Matrix4();
    leftPinchRotationMatrix.makeRotationFromQuaternion(leftPinchRot)
    leftPinchRotationMatrix.extractBasis(leftPinchRight, leftPinchUp, leftPinchForward);
    
    let rightPinchRight = new THREE.Vector3();
    let rightPinchUp = new THREE.Vector3();
    let rightPinchForward = new THREE.Vector3();
    let rightPinchRotationMatrix = new THREE.Matrix4();
    rightPinchRotationMatrix.makeRotationFromQuaternion(rightPinchRot)
    rightPinchRotationMatrix.extractBasis(rightPinchRight, rightPinchUp, rightPinchForward);

    let leftNormal = leftPinchRight.clone();
    let rightNormal = rightPinchRight.clone().negate();
    let planeUp = new THREE.Vector3().lerpVectors(leftNormal, rightNormal, 0.5).normalize();

    let planeRight = new THREE.Vector3().subVectors(rightPinchPos, leftPinchPos);
    planeRight.projectOnPlane(planeUp).normalize();

    let planeForward = new THREE.Vector3().crossVectors(planeRight, planeUp).normalize();

    let planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    let planePos = new THREE.Vector3().lerpVectors(leftPinchPos, rightPinchPos, 0.5);
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