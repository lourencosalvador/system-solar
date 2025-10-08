/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState({
    alpha: 0, // Z axis
    beta: 0,  // X axis
    gamma: 0  // Y axis
  });
  const [permissionGranted, setPermissionGranted] = useState(false);

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
    
    setDeviceOrientation({
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    });
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

  // Aplicar transformações 3D baseadas na orientação
  useEffect(() => {
    if (!isVRMode || !containerRef.current) return;

    const container = containerRef.current;
    const { alpha, beta, gamma } = deviceOrientation;

    // Converter orientação em rotações 3D
    const rotateX = (beta - 90) * 0.5; // Inclinar para frente/trás
    const rotateY = gamma * 0.5; // Inclinar para esquerda/direita
    const rotateZ = alpha * 0.1; // Rotação no eixo Z

    container.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      rotateZ(${rotateZ}deg)
      scale(${isVRMode ? 0.8 : 1})
    `;
  }, [deviceOrientation, isVRMode]);

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

    // Reset container transform
    if (containerRef.current) {
      containerRef.current.style.transform = "";
    }

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
        </div>
      )}
      
      <div className="container" ref={containerRef}>
        <div className="sun">
          <Image src="/images/sun.png" alt="Sol" width={130} height={130} />
        </div>
        
        <div className="mercury">
          <div className="planet-body mercury-body"></div>
        </div>
        
        <div className="venus">
          <div className="planet-body venus-body"></div>
        </div>
        
        <div className="earth">
          <div className="planet-body earth-body"></div>
          <div className="moon">
            <div className="planet-body moon-body"></div>
          </div>
        </div>
        
        <div className="mars">
          <div className="planet-body mars-body"></div>
        </div>
        
        <div className="jupiter">
          <div className="planet-body jupiter-body"></div>
        </div>
        
        <div className="saturn">
          <div className="planet-body saturn-body"></div>
        </div>
        
        <div className="uranus">
          <div className="planet-body uranus-body"></div>
        </div>
        
        <div className="neptune">
          <div className="planet-body neptune-body"></div>
        </div>
        
        <div className="pluto">
          <div className="planet-body pluto-body"></div>
        </div>
      </div>
    </>
  );
}
