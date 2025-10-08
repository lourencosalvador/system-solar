/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);

  const alphaSpring = useSpring(0, { stiffness: 50, damping: 20 });
  const betaSpring = useSpring(0, { stiffness: 50, damping: 20 });
  const gammaSpring = useSpring(0, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(betaSpring, (v) => -(v - 90) * 0.8);
  const rotateY = useTransform(gammaSpring, (v) => -v * 0.8);
  const rotateZ = useTransform(alphaSpring, (v) => v * 0.2);

  const requestMotionPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          return true;
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
      }
    } else {
      setPermissionGranted(true);
      return true;
    }
    return false;
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!isVRMode) return;
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    alphaSpring.set(alpha);
    betaSpring.set(beta);
    gammaSpring.set(gamma);
  };

  useEffect(() => {
    const createStars = () => {
      const background = document.querySelector(".stars-background");
      if (!background) return;
      background.innerHTML = '';
      for (let i = 0; i < 1000; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.width = Math.random() * 2 + "px";
        star.style.height = star.style.width;
        star.style.top = Math.random() * 100 + "%";
        star.style.left = Math.random() * 100 + "%";
        star.style.opacity = String(Math.random() * 0.7 + 0.3);
        background.appendChild(star);
      }
    };

    createStars();

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    };
  }, [permissionGranted, isVRMode, handleDeviceOrientation]);

  useEffect(() => {
    if (!isVRMode) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('Reconhecimento de voz não suportado');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    const planetNames: { [key: string]: string } = {
      'sol': 'sun',
      'mercúrio': 'mercury',
      'mercurio': 'mercury',
      'vênus': 'venus',
      'venus': 'venus',
      'terra': 'earth',
      'marte': 'mars',
      'júpiter': 'jupiter',
      'jupiter': 'jupiter',
      'saturno': 'saturn',
      'urano': 'uranus',
      'úrano': 'uranus',
      'netuno': 'neptune',
      'neptuno': 'neptune',
      'plutão': 'pluto',
      'pluto': 'pluto'
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Você disse:', transcript);
      for (const [name, planetId] of Object.entries(planetNames)) {
        if (transcript.includes(name)) {
          setFocusedPlanet(planetId);
          setTimeout(() => setFocusedPlanet(null), 5000);
          break;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
    };

    recognition.onend = () => {
      if (isVRMode) {
        try {
          recognition.start();
        } catch (e) {
          console.log('Reconhecimento já está ativo');
        }
      }
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
    }

    return () => {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (error) {
        console.log('Erro ao parar reconhecimento:', error);
      }
    };
  }, [isVRMode]);

  const enterVR = async () => {
    const hasPermission = await requestMotionPermission();
    if (!hasPermission) {
      alert('Permissão para sensores de movimento é necessária para VR');
      return;
    }

    const element = document.documentElement;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ('webkitRequestFullscreen' in element) {
        await (element as HTMLElement & { webkitRequestFullscreen(): Promise<void> }).webkitRequestFullscreen();
      } else if ('msRequestFullscreen' in element) {
        await (element as HTMLElement & { msRequestFullscreen(): Promise<void> }).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Erro ao entrar em fullscreen:', error);
    }

    setIsVRMode(true);

    if ('screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation) {
      try {
        await (window.screen.orientation as any).lock('landscape');
      } catch (error) {
        console.log('Não foi possível bloquear a orientação:', error);
      }
    }
  };

  const exitVR = async () => {
    setIsVRMode(false);
    setFocusedPlanet(null);

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ('webkitExitFullscreen' in document) {
        await (document as Document & { webkitExitFullscreen(): Promise<void> }).webkitExitFullscreen();
      } else if ('msExitFullscreen' in document) {
        await (document as Document & { msExitFullscreen(): Promise<void> }).msExitFullscreen();
      }
    } catch (error) {
      console.error('Erro ao sair do fullscreen:', error);
    }

    if ('screen' in window && 'orientation' in window.screen && 'unlock' in window.screen.orientation) {
      try {
        window.screen.orientation.unlock();
      } catch (error) {
        console.log('Não foi possível desbloquear a orientação:', error);
      }
    }
  };

  return (
    <>
      <div className="stars-background"></div>
      <div className="vr-controls">
        {!isVRMode ? (
          <>
            <button onClick={enterVR} className="vr-button">
              🥽 Entrar VR
            </button>
            <button onClick={requestMotionPermission} className="vr-button permission-button">
              {permissionGranted ? '✅ Sensores OK' : '📱 Ativar Sensores'}
            </button>
          </>
        ) : (
          <button onClick={exitVR} className="vr-button exit-button">
            ❌ Sair VR
          </button>
        )}
      </div>
      <motion.div 
        className="container" 
        ref={containerRef}
        style={{
          rotateX: isVRMode ? rotateX : 0,
          rotateY: isVRMode ? rotateY : 0,
          rotateZ: isVRMode ? rotateZ : 0,
        }}
      >
        <motion.div 
          className="sun"
          animate={{
            scale: focusedPlanet === 'sun' ? 2.5 : 1,
            z: focusedPlanet === 'sun' ? 200 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <Image src="/images/sun.png" alt="Sol" width={130} height={130} />
        </motion.div>
        
        <motion.div 
          className="mercury"
          animate={{
            scale: focusedPlanet === 'mercury' ? 4 : 1,
            z: focusedPlanet === 'mercury' ? 300 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body mercury-body"></div>
        </motion.div>
        
        <motion.div 
          className="venus"
          animate={{
            scale: focusedPlanet === 'venus' ? 3.5 : 1,
            z: focusedPlanet === 'venus' ? 300 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body venus-body"></div>
        </motion.div>
        
        <motion.div 
          className="earth"
          animate={{
            scale: focusedPlanet === 'earth' ? 3.5 : 1,
            z: focusedPlanet === 'earth' ? 300 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body earth-body"></div>
          <div className="moon">
            <div className="planet-body moon-body"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mars"
          animate={{
            scale: focusedPlanet === 'mars' ? 3.8 : 1,
            z: focusedPlanet === 'mars' ? 300 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body mars-body"></div>
        </motion.div>
        
        <motion.div 
          className="jupiter"
          animate={{
            scale: focusedPlanet === 'jupiter' ? 2 : 1,
            z: focusedPlanet === 'jupiter' ? 250 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body jupiter-body"></div>
        </motion.div>
        
        <motion.div 
          className="saturn"
          animate={{
            scale: focusedPlanet === 'saturn' ? 2.2 : 1,
            z: focusedPlanet === 'saturn' ? 250 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body saturn-body"></div>
        </motion.div>
        
        <motion.div 
          className="uranus"
          animate={{
            scale: focusedPlanet === 'uranus' ? 2.8 : 1,
            z: focusedPlanet === 'uranus' ? 280 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body uranus-body"></div>
        </motion.div>
        
        <motion.div 
          className="neptune"
          animate={{
            scale: focusedPlanet === 'neptune' ? 2.8 : 1,
            z: focusedPlanet === 'neptune' ? 280 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body neptune-body"></div>
        </motion.div>
        
        <motion.div 
          className="pluto"
          animate={{
            scale: focusedPlanet === 'pluto' ? 5 : 1,
            z: focusedPlanet === 'pluto' ? 350 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="planet-body pluto-body"></div>
        </motion.div>
      </motion.div>
    </>
  );
}
