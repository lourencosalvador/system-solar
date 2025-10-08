'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Cleanup ao desmontar
    return () => {
      const container = document.querySelector("body");
      if (container) {
        const stars = container.querySelectorAll('.star');
        stars.forEach(star => star.remove());
      }
    };
  }, []);

  const enterVR = () => {
    const element = document.documentElement;
    
    // Entrar em fullscreen
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ('webkitRequestFullscreen' in element) {
      (element as HTMLElement & { webkitRequestFullscreen(): Promise<void> }).webkitRequestFullscreen();
    } else if ('msRequestFullscreen' in element) {
      (element as HTMLElement & { msRequestFullscreen(): Promise<void> }).msRequestFullscreen();
    }

    // Aplicar transformações VR
    const body = document.body;
    body.style.transform = "scale(0.5)";
    body.style.transformOrigin = "center center";
    body.style.width = "200%";
    body.style.height = "200%";
    body.style.display = "flex";
    body.style.justifyContent = "center";
    body.style.alignItems = "center";
    
    // Adicionar classe VR para estilos específicos
    body.classList.add('vr-mode');
  };

  const exitVR = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ('webkitExitFullscreen' in document) {
      (document as Document & { webkitExitFullscreen(): Promise<void> }).webkitExitFullscreen();
    } else if ('msExitFullscreen' in document) {
      (document as Document & { msExitFullscreen(): Promise<void> }).msExitFullscreen();
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
    body.classList.remove('vr-mode');
  };

  return (
    <>
      <div className="vr-controls">
        <button onClick={enterVR} className="vr-button">
          Entrar VR
        </button>
        <button onClick={exitVR} className="vr-button">
          Sair VR
        </button>
      </div>
      
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
