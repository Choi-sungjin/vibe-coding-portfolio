/**
 * 히어로 핸드트래킹 데모:
 * - MediaPipe Hand Landmarker 로드
 * - 카메라 입력 / 랜드마크 오버레이
 * - 로봇손 출력 매핑 / 3D 반응
 */
(function () {
  if (window.__handTrackingDemoInitialized) return;
  window.__handTrackingDemoInitialized = true;

  var VISION_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs';
  var WASM_ROOT_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
  var MODEL_ASSET_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  var POSE_SWITCH_MARGIN = 72;
  var POSE_SWITCH_CONFIRM_FRAMES = 2;
  var SPECIAL_POSE_CONFIRM_FRAMES = 1;

  var HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
  ];

  var FINGER_CONFIGS = [
    { key: 'thumb', label: 'TH', tip: 4, chain: [1, 2, 3, 4], color: 'rgba(255, 156, 96, 0.96)' },
    { key: 'index', label: 'IN', tip: 8, chain: [5, 6, 7, 8], color: 'rgba(95, 209, 255, 0.96)' },
    { key: 'middle', label: 'MD', tip: 12, chain: [9, 10, 11, 12], color: 'rgba(114, 245, 187, 0.96)' },
    { key: 'ring', label: 'RG', tip: 16, chain: [13, 14, 15, 16], color: 'rgba(195, 129, 255, 0.96)' },
    { key: 'pinky', label: 'PK', tip: 20, chain: [17, 18, 19, 20], color: 'rgba(255, 110, 204, 0.96)' }
  ];

  var ROBOT_POSE_LIBRARY = [
    {
      key: 'open',
      label: 'Open Hand',
      src: 'assets/images/projects/robot-hand-poses/pose-open.png',
      targets: [94, 100, 100, 100, 100]
    },
    {
      key: 'open-soft',
      label: 'Open Soft',
      src: 'assets/images/projects/robot-hand-poses/pose-open-soft.png',
      targets: [94, 97, 98, 96, 96]
    },
    {
      key: 'relaxed-open',
      label: 'Relaxed Open',
      src: 'assets/images/projects/robot-hand-poses/pose-relaxed-open.png',
      targets: [94, 91, 93, 91, 89]
    },
    {
      key: 'thumb-open',
      label: 'Thumb Open',
      src: 'assets/images/projects/robot-hand-poses/pose-thumb-open.png',
      targets: [96, 82, 84, 80, 78]
    },
    {
      key: 'curl-soft',
      label: 'Curl Soft',
      src: 'assets/images/projects/robot-hand-poses/pose-curl-soft.png',
      targets: [94, 72, 74, 70, 68]
    },
    {
      key: 'claw',
      label: 'Claw',
      src: 'assets/images/projects/robot-hand-poses/pose-claw.png',
      targets: [90, 58, 56, 54, 52]
    },
    {
      key: 'grip-mid',
      label: 'Grip Mid',
      src: 'assets/images/projects/robot-hand-poses/pose-grip-mid.png',
      targets: [84, 46, 44, 42, 40]
    },
    {
      key: 'grip-tight',
      label: 'Grip Tight',
      src: 'assets/images/projects/robot-hand-poses/pose-grip-tight.png',
      targets: [76, 32, 30, 28, 26]
    },
    {
      key: 'hook',
      label: 'Hook',
      src: 'assets/images/projects/robot-hand-poses/pose-hook.png',
      targets: [68, 22, 20, 18, 18]
    },
    {
      key: 'fist',
      label: 'Fist',
      src: 'assets/images/projects/robot-hand-poses/pose-fist.png',
      targets: [24, 10, 10, 10, 10]
    },
    {
      key: 'rock',
      label: 'Rock',
      src: 'assets/images/projects/robot-hand-poses/pose-rock.png',
      targets: [86, 96, 18, 18, 92]
    },
    {
      key: 'split',
      label: 'Split',
      src: 'assets/images/projects/robot-hand-poses/pose-split.png',
      targets: [82, 100, 96, 24, 64]
    },
    {
      key: 'precision',
      label: 'Precision',
      src: 'assets/images/projects/robot-hand-poses/pose-precision.png',
      targets: [84, 98, 96, 48, 82]
    },
    {
      key: 'tripod',
      label: 'Tripod',
      src: 'assets/images/projects/robot-hand-poses/pose-tripod.png',
      targets: [86, 96, 34, 94, 90]
    },
    {
      key: 'ring-fold',
      label: 'Ring Fold',
      src: 'assets/images/projects/robot-hand-poses/pose-ring-fold.png',
      targets: [84, 98, 100, 36, 98]
    }
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function subtract(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: (a.z || 0) - (b.z || 0)
    };
  }

  function syncCanvasSize(canvas) {
    var rect = canvas.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    return {
      width: width,
      height: height,
      dpr: dpr
    };
  }

  function clearCanvas(ctx, canvas) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function prepareContext(ctx, size) {
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function buildAffineTransform(p0, p1, p2, q0, q1, q2) {
    var s11 = p1.x - p0.x;
    var s12 = p2.x - p0.x;
    var s21 = p1.y - p0.y;
    var s22 = p2.y - p0.y;
    var det = s11 * s22 - s12 * s21;

    if (Math.abs(det) < 0.00001) return null;

    var inv00 = s22 / det;
    var inv01 = -s12 / det;
    var inv10 = -s21 / det;
    var inv11 = s11 / det;

    var d11 = q1.x - q0.x;
    var d12 = q2.x - q0.x;
    var d21 = q1.y - q0.y;
    var d22 = q2.y - q0.y;

    return {
      a00: d11 * inv00 + d12 * inv10,
      a01: d11 * inv01 + d12 * inv11,
      a10: d21 * inv00 + d22 * inv10,
      a11: d21 * inv01 + d22 * inv11,
      ox: q0.x,
      oy: q0.y,
      px: p0.x,
      py: p0.y
    };
  }

  function applyAffineTransform(point, transform) {
    var dx = point.x - transform.px;
    var dy = point.y - transform.py;

    return {
      x: transform.ox + transform.a00 * dx + transform.a01 * dy,
      y: transform.oy + transform.a10 * dx + transform.a11 * dy,
      z: point.z || 0
    };
  }

  function getHandednessLabel(result) {
    var category = result && result.handedness && result.handedness[0] && result.handedness[0][0];
    if (!category) return 'Unknown';
    return category.displayName || category.categoryName || 'Detected';
  }

  function getPoseLabel(landmarks) {
    if (!landmarks || !landmarks.length) return 'Ready';

    var palmSize = Math.max(distance(landmarks[0], landmarks[9]), 0.001);
    var pinchRatio = distance(landmarks[4], landmarks[8]) / palmSize;
    var fingerSpread =
      (distance(landmarks[8], landmarks[0]) +
      distance(landmarks[12], landmarks[0]) +
      distance(landmarks[16], landmarks[0]) +
      distance(landmarks[20], landmarks[0])) / (4 * palmSize);

    if (pinchRatio < 0.48) return 'Pinch';
    if (fingerSpread < 1.18) return 'Closed';
    if (fingerSpread > 1.78) return 'Open hand';
    return 'Tracking';
  }

  function buildFingerValueMap(fingerMetrics) {
    var map = {};
    fingerMetrics.forEach(function (metric) {
      map[metric.key] = metric.intensity;
    });
    return map;
  }

  function computePoseSignals(landmarks, fingerMetrics) {
    var palmSize = Math.max(distance(landmarks[0], landmarks[9]), 0.001);
    var values = buildFingerValueMap(fingerMetrics);

    return {
      thumb: values.thumb || 0,
      index: values.index || 0,
      middle: values.middle || 0,
      ring: values.ring || 0,
      pinky: values.pinky || 0,
      pinchIndex: distance(landmarks[4], landmarks[8]) / palmSize,
      pinchMiddle: distance(landmarks[4], landmarks[12]) / palmSize,
      pinchRing: distance(landmarks[4], landmarks[16]) / palmSize,
      spreadIndexMiddle: distance(landmarks[8], landmarks[12]) / palmSize,
      spreadMiddleRing: distance(landmarks[12], landmarks[16]) / palmSize,
      spreadRingPinky: distance(landmarks[16], landmarks[20]) / palmSize
    };
  }

  function getDepthText(worldLandmarks) {
    if (!worldLandmarks || !worldLandmarks.length || typeof worldLandmarks[9].z !== 'number') {
      return '0.0 cm';
    }

    return (Math.abs(worldLandmarks[9].z) * 100).toFixed(1) + ' cm';
  }

  function toPixelPoints(landmarks, width, height) {
    return landmarks.map(function (point) {
      return {
        x: point.x * width,
        y: point.y * height,
        z: point.z || 0
      };
    });
  }

  function smoothPoints(previous, nextPoints, amount) {
    if (!previous || previous.length !== nextPoints.length) {
      return nextPoints.map(function (point) {
        return { x: point.x, y: point.y, z: point.z || 0 };
      });
    }

    return nextPoints.map(function (point, index) {
      return {
        x: lerp(previous[index].x, point.x, amount),
        y: lerp(previous[index].y, point.y, amount),
        z: lerp(previous[index].z || 0, point.z || 0, amount)
      };
    });
  }

  function smoothValues(previous, nextValues, amount) {
    if (!previous || previous.length !== nextValues.length) {
      return nextValues.slice();
    }

    return nextValues.map(function (value, index) {
      return lerp(previous[index], value, amount);
    });
  }

  function drawConnections(ctx, points, color, lineWidth, glow) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = glow || color;
    ctx.shadowBlur = 12;

    HAND_CONNECTIONS.forEach(function (pair) {
      var start = points[pair[0]];
      var end = points[pair[1]];
      if (!start || !end) return;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
  }

  function drawPoints(ctx, points, baseColor, glowColor, radiusScale) {
    points.forEach(function (point, index) {
      var radius = (index === 4 || index === 8 || index === 12 || index === 16 || index === 20) ? 5.8 : 4.2;
      radius = radius * (radiusScale || 1);

      ctx.beginPath();
      ctx.fillStyle = baseColor;
      ctx.shadowColor = glowColor || baseColor;
      ctx.shadowBlur = 16;
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawInputHand(ctx, points) {
    drawConnections(ctx, points, 'rgba(78, 223, 255, 0.92)', 2.2, 'rgba(78, 223, 255, 0.8)');
    drawPoints(ctx, points, 'rgba(255, 255, 255, 0.96)', 'rgba(78, 223, 255, 0.95)', 1);
  }

  function drawRobotFingerHighlights(ctx, points, fingerMetrics) {
    fingerMetrics.forEach(function (metric, index) {
      var config = FINGER_CONFIGS[index];
      var tipPoint = points[config.tip];
      if (!tipPoint) return;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = config.color;
      ctx.fillStyle = config.color;
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3 + metric.intensity * 5;

      ctx.beginPath();
      config.chain.forEach(function (pointIndex, chainIndex) {
        var point = points[pointIndex];
        if (!point) return;
        if (chainIndex === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tipPoint.x, tipPoint.y, 7 + metric.intensity * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(config.label, tipPoint.x, tipPoint.y - 14);
      ctx.restore();
    });
  }

  function drawRobotHand(ctx, points, fingerMetrics) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    drawConnections(ctx, points, 'rgba(95, 209, 255, 0.95)', 3.6, 'rgba(68, 190, 255, 0.9)');
    drawConnections(ctx, points, 'rgba(194, 129, 255, 0.55)', 6.4, 'rgba(176, 111, 216, 0.72)');
    drawPoints(ctx, points, 'rgba(236, 244, 255, 0.96)', 'rgba(95, 209, 255, 0.92)', 1.18);
    if (fingerMetrics && fingerMetrics.length) {
      drawRobotFingerHighlights(ctx, points, fingerMetrics);
    }
    ctx.restore();
  }

  function computeFingerMetrics(landmarks) {
    var palmSize = Math.max(distance(landmarks[0], landmarks[9]), 0.001);

    return FINGER_CONFIGS.map(function (config) {
      var mcp = landmarks[config.chain[0]];
      var pip = landmarks[config.chain[1]];
      var dip = landmarks[config.chain[2]];
      var tip = landmarks[config.chain[3]];
      var chainLength = Math.max(distance(mcp, pip) + distance(pip, dip) + distance(dip, tip), 0.001);
      var directReach = distance(mcp, tip) / chainLength;
      var wristReach = distance(tip, landmarks[0]) / palmSize;
      var straightness = clamp((directReach - 0.5) / 0.34, 0, 1);
      var span = clamp((wristReach - 0.72) / 1.02, 0, 1);
      var extension = clamp(straightness * 0.68 + span * 0.32, 0, 1);

      return {
        key: config.key,
        value: Math.round(extension * 100),
        intensity: extension
      };
    });
  }

  function preloadRobotPoses() {
    ROBOT_POSE_LIBRARY.forEach(function (pose) {
      var image = new Image();
      image.src = pose.src;
      pose.image = image;
    });
  }

  function findPoseByKey(key) {
    var index;
    for (index = 0; index < ROBOT_POSE_LIBRARY.length; index += 1) {
      if (ROBOT_POSE_LIBRARY[index].key === key) return ROBOT_POSE_LIBRARY[index];
    }
    return null;
  }

  function scoreRobotPose(pose, values) {
    var score = 0;
    pose.targets.forEach(function (target, index) {
      var delta = (values[index] || 0) - target;
      score += delta * delta;
    });
    return score;
  }

  function pickRobotPose(values) {
    var bestPose = ROBOT_POSE_LIBRARY[0];
    var bestScore = Infinity;

    ROBOT_POSE_LIBRARY.forEach(function (pose) {
      var score = scoreRobotPose(pose, values);
      if (score < bestScore) {
        bestScore = score;
        bestPose = pose;
      }
    });

    return {
      pose: bestPose,
      score: bestScore
    };
  }

  function getExplicitPoseOverride(signals) {
    if (
      signals.pinchIndex < 0.34 &&
      signals.middle > 0.68 &&
      signals.pinky > 0.52 &&
      signals.thumb > 0.62
    ) {
      return findPoseByKey('precision');
    }

    if (
      signals.index > 0.72 &&
      signals.middle > 0.72 &&
      signals.ring < 0.46 &&
      signals.pinky > 0.72 &&
      signals.thumb > 0.58
    ) {
      return findPoseByKey('ring-fold');
    }

    if (
      signals.index > 0.72 &&
      signals.middle > 0.72 &&
      signals.ring < 0.44 &&
      signals.pinky > 0.34 &&
      signals.pinky < 0.7 &&
      signals.thumb > 0.56
    ) {
      return findPoseByKey('split');
    }

    if (
      signals.pinchIndex < 0.42 &&
      signals.middle > 0.58 &&
      signals.ring < 0.58 &&
      signals.pinky < 0.58 &&
      signals.thumb > 0.56
    ) {
      return findPoseByKey('tripod');
    }

    return null;
  }

  function computeRobotPoints(landmarks, width, height) {
    var anchors = {
      wrist: { x: width * 0.50, y: height * 0.82 },
      indexMcp: { x: width * 0.62, y: height * 0.48 },
      pinkyMcp: { x: width * 0.33, y: height * 0.56 }
    };

    var transform = buildAffineTransform(
      { x: landmarks[0].x, y: landmarks[0].y },
      { x: landmarks[5].x, y: landmarks[5].y },
      { x: landmarks[17].x, y: landmarks[17].y },
      anchors.wrist,
      anchors.indexMcp,
      anchors.pinkyMcp
    );

    if (!transform) return [];

    return landmarks.map(function (point) {
      return applyAffineTransform(point, transform);
    });
  }

  function computeRobotRotation(landmarks, worldLandmarks) {
    var rotation = { x: 0, y: 0, z: 0 };

    if (worldLandmarks && worldLandmarks.length >= 18) {
      var wrist = worldLandmarks[0];
      var indexMcp = worldLandmarks[5];
      var pinkyMcp = worldLandmarks[17];
      var palmNormal = cross(subtract(indexMcp, wrist), subtract(pinkyMcp, wrist));

      rotation.x = clamp(-palmNormal.y * 72, -20, 20);
      rotation.y = clamp(palmNormal.x * 96, -26, 26);
    }

    if (landmarks && landmarks.length >= 18) {
      var palmAngle = Math.atan2(landmarks[5].y - landmarks[17].y, landmarks[5].x - landmarks[17].x);
      rotation.z = clamp((palmAngle * 180 / Math.PI) * 0.6, -20, 20);
    }

    return rotation;
  }

  function init() {
    var shell = document.getElementById('cameraPreviewShell');
    var video = document.getElementById('handTrackingCamera');
    var overlayCanvas = document.getElementById('handTrackingOverlay');
    var robotCanvas = document.getElementById('robotMappingCanvas');
    var robotStage = document.getElementById('robotStage');
    var robotBackdrop = document.getElementById('robotStageBackdrop');
    var robotMotion = document.getElementById('robotStageMotion');
    var placeholder = document.getElementById('cameraPreviewPlaceholder');
    var requestBtn = document.getElementById('cameraRequestBtn');
    var disconnectBtn = document.getElementById('cameraDisconnectBtn');
    var status = document.getElementById('cameraStatusMessage');
    var trackingChip = document.getElementById('trackingChip');
    var robotTrackingState = document.getElementById('robotTrackingState');
    var trackingMetric = document.getElementById('trackingMetric');
    var handednessMetric = document.getElementById('handednessMetric');
    var gestureMetric = document.getElementById('gestureMetric');
    var depthMetric = document.getElementById('depthMetric');
    var robotBaseImage = robotStage ? robotStage.querySelector('.robot-hand-visual-base') : null;
    var robotBlendImage = document.getElementById('robotHandBlendVisual');
    var fingerMetrics = {
      thumb: {
        value: document.getElementById('thumbMetricValue'),
        bar: document.getElementById('thumbMetricBar')
      },
      index: {
        value: document.getElementById('indexMetricValue'),
        bar: document.getElementById('indexMetricBar')
      },
      middle: {
        value: document.getElementById('middleMetricValue'),
        bar: document.getElementById('middleMetricBar')
      },
      ring: {
        value: document.getElementById('ringMetricValue'),
        bar: document.getElementById('ringMetricBar')
      },
      pinky: {
        value: document.getElementById('pinkyMetricValue'),
        bar: document.getElementById('pinkyMetricBar')
      }
    };

    if (
      !shell || !video || !overlayCanvas || !robotCanvas || !robotStage ||
      !robotBackdrop || !robotMotion ||
      !placeholder || !requestBtn || !disconnectBtn || !status ||
      !trackingChip || !robotTrackingState || !trackingMetric ||
      !handednessMetric || !gestureMetric || !depthMetric || !robotBaseImage || !robotBlendImage ||
      !fingerMetrics.thumb.value || !fingerMetrics.thumb.bar ||
      !fingerMetrics.index.value || !fingerMetrics.index.bar ||
      !fingerMetrics.middle.value || !fingerMetrics.middle.bar ||
      !fingerMetrics.ring.value || !fingerMetrics.ring.bar ||
      !fingerMetrics.pinky.value || !fingerMetrics.pinky.bar
    ) {
      return;
    }

    var inputCtx = overlayCanvas.getContext('2d');
    var robotCtx = robotCanvas.getContext('2d');
    var state = {
      modulePromise: null,
      handLandmarker: null,
      stream: null,
      rafId: 0,
      running: false,
      lastVideoTime: -1,
      smoothedRobotPoints: null,
      smoothedFingerValues: null,
      smoothedRotation: { x: 0, y: 0, z: 0 },
      pendingRobotPoseKey: '',
      pendingRobotPoseFrames: 0,
      currentRobotPoseKey: '',
      poseBlendRafId: 0,
      destroyed: false
    };

    function setChip(target, text, tone) {
      target.textContent = text;
      target.classList.remove('is-live', 'is-pending', 'is-error');
      if (tone === 'live') target.classList.add('is-live');
      if (tone === 'pending') target.classList.add('is-pending');
      if (tone === 'error') target.classList.add('is-error');
    }

    function setStatus(nextState, message) {
      shell.setAttribute('data-camera-state', nextState);
      status.textContent = message;
    }

    function resetMetrics() {
      trackingMetric.textContent = 'Waiting';
      handednessMetric.textContent = 'Not detected';
      gestureMetric.textContent = 'Ready';
      depthMetric.textContent = '0.0 cm';
      Object.keys(fingerMetrics).forEach(function (key) {
        fingerMetrics[key].value.textContent = '0%';
        fingerMetrics[key].bar.style.width = '0%';
      });
    }

    function resetPendingRobotPose() {
      state.pendingRobotPoseKey = '';
      state.pendingRobotPoseFrames = 0;
    }

    function clearPoseBlend() {
      if (state.poseBlendRafId) {
        cancelAnimationFrame(state.poseBlendRafId);
        state.poseBlendRafId = 0;
      }
      robotBlendImage.classList.remove('is-visible');
    }

    function setRobotPose(pose, skipBlend) {
      if (!pose) return;
      if (state.currentRobotPoseKey === pose.key && !skipBlend) return;

      var previousSrc = robotBaseImage.getAttribute('src') || pose.src;
      clearPoseBlend();

      if (!state.currentRobotPoseKey || skipBlend) {
        robotBaseImage.src = pose.src;
        robotBlendImage.src = pose.src;
      } else {
        robotBlendImage.src = previousSrc;
        robotBlendImage.classList.add('is-visible');
        robotBaseImage.src = pose.src;
        state.poseBlendRafId = requestAnimationFrame(function () {
          state.poseBlendRafId = requestAnimationFrame(function () {
            robotBlendImage.classList.remove('is-visible');
            state.poseBlendRafId = 0;
          });
        });
      }

      state.currentRobotPoseKey = pose.key;
      robotBackdrop.setAttribute('data-pose', pose.key);
      robotStage.style.setProperty('--robot-stage-image', 'url("' + pose.src + '")');
    }

    function hidePlaceholder() {
      placeholder.hidden = true;
    }

    function showPlaceholder() {
      placeholder.hidden = false;
    }

    function resetRobotTransform() {
      state.smoothedRotation = { x: 0, y: 0, z: 0 };
      clearPoseBlend();
      robotMotion.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      robotBaseImage.style.transform = 'translate3d(0px, 0px, 16px) scale(1)';
      robotBlendImage.style.transform = 'translate3d(0px, 0px, 16px) scale(1)';
    }

    function applyRobotTransform(targetRotation, hasHand, worldLandmarks, landmarks) {
      state.smoothedRotation.x = lerp(state.smoothedRotation.x, targetRotation.x, 0.14);
      state.smoothedRotation.y = lerp(state.smoothedRotation.y, targetRotation.y, 0.14);
      state.smoothedRotation.z = lerp(state.smoothedRotation.z, targetRotation.z, 0.16);

      var depthScale = 1;
      var offsetX = 0;
      var offsetY = 0;
      if (hasHand && worldLandmarks && worldLandmarks.length > 9 && typeof worldLandmarks[9].z === 'number') {
        depthScale = 1 + clamp(Math.abs(worldLandmarks[9].z) * 0.8, 0, 0.08);
      }
      if (hasHand && landmarks && landmarks.length > 9) {
        offsetX = clamp((landmarks[9].x - 0.5) * 26, -12, 12);
        offsetY = clamp((landmarks[9].y - 0.5) * 18, -10, 10);
      }

      robotMotion.style.transform =
        'perspective(1400px) rotateX(' + state.smoothedRotation.x.toFixed(2) + 'deg) ' +
        'rotateY(' + state.smoothedRotation.y.toFixed(2) + 'deg) ' +
        'rotateZ(' + state.smoothedRotation.z.toFixed(2) + 'deg)';
      var transformValue =
        'translate3d(' + offsetX.toFixed(2) + 'px, ' + offsetY.toFixed(2) + 'px, 16px) ' +
        'scale(' + depthScale.toFixed(3) + ')';
      robotBaseImage.style.transform = transformValue;
      robotBlendImage.style.transform = transformValue;
    }

    function selectStableRobotPose(values, signals) {
      var bestMatch = pickRobotPose(values);
      var explicitPose = getExplicitPoseOverride(signals);
      var currentPose = findPoseByKey(state.currentRobotPoseKey);
      var targetPose = explicitPose || bestMatch.pose;
      var requiredFrames = explicitPose ? SPECIAL_POSE_CONFIRM_FRAMES : POSE_SWITCH_CONFIRM_FRAMES;

      if (!currentPose) {
        resetPendingRobotPose();
        return targetPose;
      }

      if (currentPose.key === targetPose.key) {
        resetPendingRobotPose();
        return currentPose;
      }

      if (!explicitPose && scoreRobotPose(currentPose, values) <= bestMatch.score + POSE_SWITCH_MARGIN) {
        resetPendingRobotPose();
        return currentPose;
      }

      if (state.pendingRobotPoseKey !== targetPose.key) {
        state.pendingRobotPoseKey = targetPose.key;
        state.pendingRobotPoseFrames = 1;
        return currentPose;
      }

      state.pendingRobotPoseFrames += 1;
      if (state.pendingRobotPoseFrames < requiredFrames) {
        return currentPose;
      }

      resetPendingRobotPose();
      return targetPose;
    }

    function stopStream() {
      if (!state.stream) return;
      state.stream.getTracks().forEach(function (track) {
        track.stop();
      });
      state.stream = null;
    }

    function stopLoop() {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
      state.running = false;
      state.lastVideoTime = -1;
    }

    function clearVisuals() {
      clearCanvas(inputCtx, overlayCanvas);
      clearCanvas(robotCtx, robotCanvas);
      state.smoothedRobotPoints = null;
      state.smoothedFingerValues = null;
      resetRobotTransform();
    }

    function teardown(message) {
      stopLoop();
      stopStream();

      try {
        video.pause();
      } catch (error) {}

      video.srcObject = null;
      showPlaceholder();
      clearVisuals();
      resetMetrics();
      setChip(trackingChip, 'CAMERA OFF', null);
      setChip(robotTrackingState, 'IDLE', null);
      requestBtn.disabled = false;
      requestBtn.textContent = '카메라 연결';
      disconnectBtn.disabled = true;
      if (message) setStatus('idle', message);
    }

    function hasSecureAccess() {
      return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    async function ensureHandLandmarker() {
      if (state.handLandmarker) return state.handLandmarker;
      if (state.modulePromise) return state.modulePromise;

      state.modulePromise = (async function () {
        var module = await import(VISION_BUNDLE_URL);
        var vision = await module.FilesetResolver.forVisionTasks(WASM_ROOT_URL);
        var baseOptions = {
          modelAssetPath: MODEL_ASSET_URL
        };

        try {
          return await module.HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: baseOptions.modelAssetPath,
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55
          });
        } catch (gpuError) {
          return module.HandLandmarker.createFromOptions(vision, {
            baseOptions: baseOptions,
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55
          });
        }
      })();

      try {
        state.handLandmarker = await state.modulePromise;
        return state.handLandmarker;
      } catch (error) {
        state.modulePromise = null;
        state.handLandmarker = null;
        throw error;
      }
    }

    function renderSearching(inputSize) {
      clearCanvas(inputCtx, overlayCanvas);
      prepareContext(inputCtx, inputSize);
      inputCtx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      inputCtx.fillRect(0, 0, inputSize.width, inputSize.height);

      setChip(trackingChip, 'CAMERA LIVE', 'live');
      setChip(robotTrackingState, 'SEARCHING', 'pending');
      trackingMetric.textContent = 'Searching';
      handednessMetric.textContent = 'Move hand in';
      gestureMetric.textContent = 'Waiting';
      depthMetric.textContent = '0.0 cm';
      setStatus('granted', '손이 화면 안에 들어오면 21개 랜드마크와 로봇손 매핑이 시작됩니다.');
      applyRobotTransform({ x: 0, y: 0, z: 0 }, false, null, null);
      resetPendingRobotPose();
      Object.keys(fingerMetrics).forEach(function (key) {
        fingerMetrics[key].value.textContent = '0%';
        fingerMetrics[key].bar.style.width = '0%';
      });
      if (state.currentRobotPoseKey !== 'open') {
        setRobotPose(findPoseByKey('open'), true);
      }

      clearCanvas(robotCtx, robotCanvas);
    }

    function renderResults(results, inputSize, robotSize) {
      var landmarks = results.landmarks && results.landmarks[0];
      var worldLandmarks = results.worldLandmarks && results.worldLandmarks[0];

      if (!landmarks || !landmarks.length) {
        renderSearching(inputSize);
        return;
      }

      var inputPoints = toPixelPoints(landmarks, inputSize.width, inputSize.height);
      var rawRobotPoints = computeRobotPoints(landmarks, robotSize.width, robotSize.height);
      var robotPoints = smoothPoints(state.smoothedRobotPoints, rawRobotPoints, 0.34);
      var robotRotation = computeRobotRotation(landmarks, worldLandmarks);
      var handedness = getHandednessLabel(results);
      var fingerData = computeFingerMetrics(landmarks);
      var poseSignals = computePoseSignals(landmarks, fingerData);
      var smoothedFingerValues = smoothValues(
        state.smoothedFingerValues,
        fingerData.map(function (item) { return item.value; }),
        0.38
      );
      var selectedRobotPose = selectStableRobotPose(smoothedFingerValues, poseSignals);

      state.smoothedRobotPoints = robotPoints;
      state.smoothedFingerValues = smoothedFingerValues;
      setRobotPose(selectedRobotPose);

      clearCanvas(inputCtx, overlayCanvas);
      prepareContext(inputCtx, inputSize);
      drawInputHand(inputCtx, inputPoints);

      clearCanvas(robotCtx, robotCanvas);
      prepareContext(robotCtx, robotSize);
      drawRobotHand(robotCtx, robotPoints, fingerData);

      applyRobotTransform(robotRotation, true, worldLandmarks, landmarks);

      setChip(trackingChip, 'LANDMARKS LIVE', 'live');
      setChip(robotTrackingState, selectedRobotPose.label.toUpperCase(), 'live');
      trackingMetric.textContent = '21 points';
      handednessMetric.textContent = handedness;
      gestureMetric.textContent = selectedRobotPose.label;
      depthMetric.textContent = getDepthText(worldLandmarks);
      fingerData.forEach(function (item) {
        if (!fingerMetrics[item.key]) return;
        var smoothedValue = Math.round(smoothedFingerValues[FINGER_CONFIGS.findIndex(function (config) { return config.key === item.key; })] || 0);
        fingerMetrics[item.key].value.textContent = smoothedValue + '%';
        fingerMetrics[item.key].bar.style.width = smoothedValue + '%';
      });

      if (handedness.toLowerCase() === 'right') {
        setStatus('granted', '오른손이 감지되었습니다. 왼손 기준 화면이지만 추적은 계속됩니다.');
      } else {
        setStatus('granted', '왼손 랜드마크가 감지되어 로봇손 포즈와 관절 표현에 반영되고 있습니다.');
      }
    }

    function renderLoop() {
      if (!state.running || state.destroyed) return;

      var inputSize = syncCanvasSize(overlayCanvas);
      var robotSize = syncCanvasSize(robotCanvas);

      if (video.readyState >= 2 && state.handLandmarker) {
        if (video.currentTime !== state.lastVideoTime) {
          state.lastVideoTime = video.currentTime;
          var results = state.handLandmarker.detectForVideo(video, performance.now());
          renderResults(results || {}, inputSize, robotSize);
        }
      }

      state.rafId = requestAnimationFrame(renderLoop);
    }

    async function connectCamera() {
      if (state.running) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setChip(trackingChip, 'UNSUPPORTED', 'error');
        setChip(robotTrackingState, 'OFFLINE', 'error');
        setStatus('unsupported', '이 브라우저에서는 카메라 접근을 지원하지 않습니다.');
        requestBtn.disabled = true;
        disconnectBtn.disabled = true;
        return;
      }

      if (!hasSecureAccess()) {
        setChip(trackingChip, 'HTTPS ONLY', 'error');
        setChip(robotTrackingState, 'OFFLINE', 'error');
        setStatus('unsupported', '카메라 사용은 HTTPS 또는 localhost에서만 동작합니다.');
        requestBtn.disabled = true;
        disconnectBtn.disabled = true;
        return;
      }

      requestBtn.disabled = true;
      requestBtn.textContent = '모델 준비 중...';
      disconnectBtn.disabled = true;
      setChip(trackingChip, 'LOADING MODEL', 'pending');
      setChip(robotTrackingState, 'STANDBY', 'pending');
      setStatus('pending', 'MediaPipe 손 랜드마커와 카메라를 준비하고 있습니다.');

      try {
        await ensureHandLandmarker();

        requestBtn.textContent = '카메라 연결 중...';
        state.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        video.srcObject = state.stream;
        await video.play();

        hidePlaceholder();
        state.running = true;
        requestBtn.disabled = true;
        requestBtn.textContent = '카메라 연결됨';
        disconnectBtn.disabled = false;
        setChip(trackingChip, 'CAMERA LIVE', 'live');
        setChip(robotTrackingState, 'SEARCHING', 'pending');
        setStatus('granted', '카메라가 연결되었습니다. 왼손을 화면 중앙에 두면 랜드마크와 로봇손 매핑이 시작됩니다.');
        renderLoop();
      } catch (error) {
        stopStream();
        showPlaceholder();
        clearVisuals();

        if (error && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
          setChip(trackingChip, 'DENIED', 'error');
          setChip(robotTrackingState, 'OFFLINE', 'error');
          setStatus('denied', '카메라 권한이 거부되어 핸드트래킹을 사용할 수 없습니다. 브라우저 설정에서 허용해주세요.');
        } else if (error && (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError')) {
          setChip(trackingChip, 'NO CAMERA', 'error');
          setChip(robotTrackingState, 'OFFLINE', 'error');
          setStatus('unavailable', '사용 가능한 카메라를 찾지 못했습니다. 노트북 웹캠 연결 상태를 확인해주세요.');
        } else {
          setChip(trackingChip, 'ERROR', 'error');
          setChip(robotTrackingState, 'OFFLINE', 'error');
          setStatus('error', 'MediaPipe 또는 카메라를 시작하지 못했습니다. 잠시 후 다시 시도해주세요.');
        }

        requestBtn.disabled = false;
        requestBtn.textContent = '카메라 연결';
        disconnectBtn.disabled = true;
      }
    }

    function disconnectCamera() {
      teardown('카메라 연결이 끊겼습니다. 다시 연결하면 핸드트래킹을 재개할 수 있습니다.');
    }

    requestBtn.addEventListener('click', connectCamera);
    disconnectBtn.addEventListener('click', disconnectCamera);

    preloadRobotPoses();
    setRobotPose(findPoseByKey('open'), true);

    window.addEventListener('beforeunload', function () {
      state.destroyed = true;
      stopLoop();
      stopStream();
    });

    window.addEventListener('pagehide', function () {
      state.destroyed = true;
      stopLoop();
      stopStream();
    });

    window.addEventListener('resize', function () {
      clearVisuals();
      if (!state.running) resetRobotTransform();
    });

    showPlaceholder();
    resetMetrics();
    setChip(trackingChip, 'CAMERA OFF', null);
    setChip(robotTrackingState, 'IDLE', null);
    setStatus('idle', '핸드트래킹을 사용하려면 브라우저의 카메라 접근을 허용해주세요.');
    requestBtn.textContent = '카메라 연결';
    disconnectBtn.disabled = true;
    resetRobotTransform();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
