/**
 * 히어로 핸드트래킹 데모: 카메라 권한 요청과 상태 표시
 */
(function () {
  if (window.__handTrackingDemoInitialized) return;
  window.__handTrackingDemoInitialized = true;

  function init() {
    var shell = document.getElementById('cameraPreviewShell');
    var badge = document.getElementById('cameraPreviewBadge');
    var placeholder = document.getElementById('cameraPreviewPlaceholder');
    var video = document.getElementById('handTrackingCamera');
    var button = document.getElementById('cameraRequestBtn');
    var status = document.getElementById('cameraStatusMessage');

    if (!shell || !badge || !placeholder || !video || !button || !status) return;

    var stream = null;
    var stateCopy = {
      idle: {
        badge: 'WAITING',
        message: '핸드트래킹을 사용하려면 브라우저의 카메라 접근을 허용해주세요.'
      },
      pending: {
        badge: 'REQUESTING',
        message: '브라우저가 카메라 권한을 요청하고 있습니다. 허용해야 핸드트래킹이 동작합니다.'
      },
      granted: {
        badge: 'CAMERA LIVE',
        message: '카메라가 허용되었습니다. 왼손을 보여주면 핸드트래킹 입력을 받을 수 있습니다.'
      },
      denied: {
        badge: 'DENIED',
        message: '카메라 권한이 거부되어 핸드트래킹을 사용할 수 없습니다. 브라우저 설정에서 허용해주세요.'
      },
      unavailable: {
        badge: 'NO CAMERA',
        message: '카메라 장치를 찾지 못했습니다. 노트북 웹캠 연결 상태를 확인해주세요.'
      },
      unsupported: {
        badge: 'UNSUPPORTED',
        message: '이 환경에서는 카메라 접근을 사용할 수 없습니다. HTTPS 또는 localhost에서 열어주세요.'
      },
      error: {
        badge: 'ERROR',
        message: '카메라를 시작하지 못했습니다. 브라우저 권한과 장치 상태를 확인해주세요.'
      }
    };

    function setState(nextState, overrideMessage) {
      var copy = stateCopy[nextState] || stateCopy.error;
      shell.setAttribute('data-camera-state', nextState);
      badge.textContent = copy.badge;
      status.textContent = overrideMessage || copy.message;
    }

    function stopStream() {
      if (!stream) return;
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      stream = null;
    }

    function showPreview() {
      video.classList.add('is-visible');
      placeholder.hidden = true;
    }

    function showPlaceholder() {
      video.classList.remove('is-visible');
      placeholder.hidden = false;
      video.srcObject = null;
    }

    function hasSecureAccess() {
      return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    function updateButtonLabel(text, disabled) {
      button.textContent = text;
      button.disabled = !!disabled;
    }

    function handlePermissionQuery() {
      if (!navigator.permissions || !navigator.permissions.query) return;

      try {
        navigator.permissions.query({ name: 'camera' }).then(function (result) {
          if (!result) return;

          if (result.state === 'denied') {
            setState('denied');
            updateButtonLabel('카메라 권한 다시 요청', false);
          } else if (result.state === 'granted') {
            setState('idle', '카메라 권한이 이미 허용되어 있습니다. 버튼을 누르면 입력 화면을 켭니다.');
            updateButtonLabel('카메라 연결', false);
          }

          result.onchange = function () {
            if (result.state === 'denied') {
              stopStream();
              showPlaceholder();
              setState('denied');
              updateButtonLabel('카메라 권한 다시 요청', false);
            } else if (result.state === 'granted' && !stream) {
              setState('idle', '카메라 권한이 허용되었습니다. 버튼을 누르면 핸드트래킹 입력을 켭니다.');
              updateButtonLabel('카메라 연결', false);
            }
          };
        }).catch(function () {});
      } catch (error) {
        // 일부 브라우저는 camera permission query를 지원하지 않음
      }
    }

    function requestCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState('unsupported');
        updateButtonLabel('카메라 사용 불가', true);
        return;
      }

      if (!hasSecureAccess()) {
        setState('unsupported');
        updateButtonLabel('HTTPS 필요', true);
        return;
      }

      setState('pending');
      updateButtonLabel('권한 요청 중...', true);

      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user'
        }
      }).then(function (nextStream) {
        stopStream();
        stream = nextStream;
        video.srcObject = nextStream;
        showPreview();
        setState('granted');
        updateButtonLabel('카메라 다시 연결', false);
        video.play().catch(function () {});
      }).catch(function (error) {
        stopStream();
        showPlaceholder();

        if (error && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
          setState('denied');
          updateButtonLabel('카메라 권한 다시 요청', false);
          return;
        }

        if (error && (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError')) {
          setState('unavailable');
          updateButtonLabel('카메라 다시 확인', false);
          return;
        }

        setState('error');
        updateButtonLabel('카메라 다시 시도', false);
      });
    }

    showPlaceholder();
    setState('idle');
    handlePermissionQuery();

    button.addEventListener('click', requestCamera);
    window.addEventListener('beforeunload', stopStream);
    window.addEventListener('pagehide', stopStream);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
