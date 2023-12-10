import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import ScannerIcon from '@mui/icons-material/QrCodeScanner';
import StopIcon from '@mui/icons-material/Clear';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

function Scanner({ onScanResult }) {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [videoInputDevices, setVideoInputDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [opensettings, setOpensettings] = useState(false);

  const codeReader = useRef(new BrowserMultiFormatReader());
  const videoRef = useRef();

  useEffect(() => {
    navigator.permissions.query({ name: 'camera' })
      .then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          initScanner();
        } else {
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              initScanner();
            } else {
              console.error('Camera access not granted');
              alert('Camera access not granted');
            }
          };
        }
      })
      .catch((err) => {
        console.error('Error checking camera permission:', err);
      });
  }, []);

  const initScanner = () => {
    codeReader.current.listVideoInputDevices()
      .then((devices) => {
        setVideoInputDevices(devices);
  
        if (devices.length === 0) {
          console.warn('No cameras found.');
          alert('No cameras found.');
          return;
        }
  
        setSelectedDeviceId(devices[Math.min(devices.length - 1, 3)].deviceId);
      })
      .catch((err) => {
        console.error('Error listing video devices:', err);
      });
  };  

  useEffect(() => {
    if (videoRef.current && isScanning) {
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('autofocus', 'true');
    }
  }, [isScanning]);

  const setFlashState = async (flashOn) => {
    if (videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getVideoTracks();
  
      for (const track of tracks) {
        try {
          await track.applyConstraints({ advanced: [{ torch: flashOn }] });
          console.log(`Flash is ${flashOn ? 'on' : 'off'}`);
        } catch (error) {
          console.error('Error applying constraints:', error);
          onScanResult(error.message);
        }
      }
    }
  };  
  
  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    setFlashState(!isFlashOn);
  };

  const startScanning = () => {
    if (videoInputDevices.length === 0) {
      console.warn('No cameras found. Cannot start scanning.');
      alert('No cameras found. Cannot start scanning.');
      return;
    }

    codeReader.current.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
      if (result) {
        console.log('Scan result:', result.text);
        onScanResult(result.text);
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error('Scan error:', err);
        onScanResult(err.message);
      }
    });

    console.log(`Started continuous decode from camera with id ${selectedDeviceId}`);
    setIsScanning(true);
  };

  const stopScanning = () => {
    codeReader.current.reset();
    setIsScanning(false);
  };

  const handleStartClick = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const handleCameraChange = (_, { value }) => {
    setSelectedDeviceId(value);
    if (isScanning) {
      stopScanning();
      startScanning();
    }
  };

  const handleSettingsClick = () => {
    setOpensettings(!opensettings);
  }

  return (
    <div className='scanner'>
      {!isScanning && (
      <div className='scanner-button'>
        <button
          className='Scanner-submit-start'
          onClick={handleStartClick}
        >
          <ScannerIcon />
        </button>
      </div>
      )}

      {isScanning && (
        <>
          <div className='option-box'>
            {videoInputDevices.length > 1 &&
              (<button className='options-button' onClick={handleSettingsClick}>
                  {opensettings ? <ArrowDropUpIcon /> : <SettingsIcon />}
                </button>
            )}
            <button className='options-button' onClick={toggleFlash}>
              {isFlashOn ? <FlashOnIcon /> : <FlashOffIcon />}
            </button>
            <button
              className='options-button'
              onClick={handleStartClick}
            >
              <StopIcon />
            </button>
          </div>
          <br />

          <div>
            <video
              id="video"
              ref={videoRef}
              width="100%"
              height="100%"
              style={{ border: '2px solid gray', backgroundColor: 'white', maxHeight: '300px', maxWidth: '300px' }}
            ></video>
          </div>
          <br />

          {videoInputDevices.length > 1 && opensettings && (
            <div id="sourceSelectPanel">
              <label className="addbook-form-label" htmlFor="sourceSelect">Change video source:</label><br />
              <Dropdown
                id="sourceSelect"
                selection
                options={videoInputDevices.map((device) => ({
                  key: device.deviceId,
                  text: device.label,
                  value: device.deviceId,
                }))}
                value={selectedDeviceId}
                onChange={handleCameraChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Scanner;
