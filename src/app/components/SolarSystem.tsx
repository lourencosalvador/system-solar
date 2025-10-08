/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState({
    alpha: 0, // Z axis
    beta: 0,  // X axis
    gamma: 0  // Y axis
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  
  // Springs suaves para os valores de orientação
  const alphaSpring = useSpring(0, { stiffness: 50, damping: 20 });
  const betaSpring = useSpring(0, { stiffness: 50, damping: 20 });
  const gammaSpring = useSpring(0, { stiffness: 50, damping: 20 });
  
  // Transformar valores para rotações
  const rotateX = useTransform(betaSpring, (v) => (v - 90) * 0.5);
  const rotateY = useTransform(gammaSpring, (v) => v * 0.5);
  const rotateZ = useTransform(alphaSpring, (v) => v * 0.1);

  // Solicitar permissões para sensores de movimento
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
      // Para navegadores que não precisam de permissão explícita
      setPermissionGranted(true);
      return true;
    }
    return false;
  };

  // Manipular orientação do dispositivo
  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!isVRMode) return;
    
    const newOrientation = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    };
    
    setDeviceOrientation(newOrientation);
    
    // Atualizar springs para movimento suave
    alphaSpring.set(newOrientation.alpha);
    betaSpring.set(newOrientation.beta);
    gammaSpring.set(newOrientation.gamma);
  };

  useEffect(() => {
    // Criar estrelas
    const createStars = () => {
      const container = document.querySelector("body");
      if (!container) return;
      
      // Limpar estrelas existentes
      const existingStars = container.querySelectorAll('.star');
      existingStars.forEach(star => star.remove());
      
      for (let i = 0; i < 1000; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.width = ".1px";
        star.style.height = ".1px";
        star.style.top = Math.random() * 100 + "%";
        star.style.left = Math.random() * 100 + "%";
        container.appendChild(star);
      }
    };

    createStars();

    // Adicionar listener para orientação do dispositivo
    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    // Cleanup ao desmontar
    return () => {
      const container = document.querySelector("body");
      if (container) {
        const stars = container.querySelectorAll('.star');
        stars.forEach(star => star.remove());
      }
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [permissionGranted, isVRMode]);

  // Reconhecimento de voz
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
      'vênus': 'venus',
      'vénus': 'venus',
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
      
      // Procurar por nome de planeta
      for (const [name, planetId] of Object.entries(planetNames)) {
        if (transcript.includes(name)) {
          setFocusedPlanet(planetId);
          setTimeout(() => setFocusedPlanet(null), 5000); // Reset após 5 segundos
          break;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      if (event.error === 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isVRMode) {
        recognition.start();
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
    // Primeiro solicitar permissões para sensores
    const hasPermission = await requestMotionPermission();
    if (!hasPermission) {
      alert('Permissão para sensores de movimento é necessária para VR');
      return;
    }

    const element = document.documentElement;
    
    // Entrar em fullscreen
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

    // Ativar modo VR
    setIsVRMode(true);
    
    // Aplicar transformações VR
    const body = document.body;
    body.style.transformOrigin = "center center";
    body.style.width = "100vw";
    body.style.height = "100vh";
    body.style.display = "flex";
    body.style.justifyContent = "center";
    body.style.alignItems = "center";
    body.style.overflow = "hidden";
    
    // Adicionar classe VR para estilos específicos
    body.classList.add('vr-mode');

    // Bloquear orientação em landscape se possível
    if ('screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation) {
      try {
        await (window.screen.orientation as any).lock('landscape');
      } catch (error) {
        console.log('Não foi possível bloquear a orientação:', error);
      }
    }
  };

  const exitVR = async () => {
    // Desativar modo VR
    setIsVRMode(false);
    setFocusedPlanet(null);

    // Sair do fullscreen
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

    // Remover transformações VR
    const body = document.body;
    body.style.transform = "";
    body.style.transformOrigin = "";
    body.style.width = "";
    body.style.height = "";
    body.style.display = "";
    body.style.justifyContent = "";
    body.style.alignItems = "";
    body.style.overflow = "";
    body.classList.remove('vr-mode');

    // Desbloquear orientação se possível
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
      
      {isVRMode && (
        <div className="vr-info">
          <div className="orientation-display">
            <div>Alpha: {deviceOrientation.alpha.toFixed(1)}°</div>
            <div>Beta: {deviceOrientation.beta.toFixed(1)}°</div>
            <div>Gamma: {deviceOrientation.gamma.toFixed(1)}°</div>
          </div>
          <div className={`voice-indicator ${isListening ? 'listening' : ''}`}>
            🎤 {isListening ? 'Ouvindo...' : 'Voz Inativa'}
          </div>
          {focusedPlanet && (
            <div className="focused-planet-name">
              🎯 Focado em: {focusedPlanet.toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <motion.div 
        className="container" 
        ref={containerRef}
        style={{
          rotateX: isVRMode ? rotateX : 0,
          rotateY: isVRMode ? rotateY : 0,
          rotateZ: isVRMode ? rotateZ : 0,
          scale: isVRMode ? 0.8 : 1,
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