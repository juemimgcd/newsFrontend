import { useEffect, useRef, useState, type RefObject } from "react";

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = "#2d2d2d",
  forceLookX,
  forceLookY,
}: PupilProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  function calculatePupilPosition() {
    if (!pupilRef.current) {
      return { x: 0, y: 0 };
    }

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;
    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  }

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="login-character-pupil"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
      }}
    />
  );
}

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "#2d2d2d",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  function calculatePupilPosition() {
    if (!eyeRef.current) {
      return { x: 0, y: 0 };
    }

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  }

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="login-character-eye"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
      }}
    >
      {!isBlinking ? (
        <div
          className="login-character-eye__inner"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          }}
        />
      ) : null}
    </div>
  );
}

interface LoginCharacterStageProps {
  isTyping: boolean;
  password: string;
  showPassword: boolean;
}

interface Position {
  faceX: number;
  faceY: number;
  bodySkew: number;
}

function useBlinking() {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let blinkTimer = 0;
    let resetTimer = 0;

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        setBlinking(true);
        resetTimer = window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };

    scheduleBlink();

    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(resetTimer);
    };
  }, []);

  return blinking;
}

export function LoginCharacterStage({
  isTyping,
  password,
  showPassword,
}: LoginCharacterStageProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const isPurpleBlinking = useBlinking();
  const isBlackBlinking = useBlinking();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isTyping) {
      setIsLookingAtEachOther(false);
      return;
    }

    setIsLookingAtEachOther(true);
    const timer = window.setTimeout(() => {
      setIsLookingAtEachOther(false);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    if (!(password.length > 0 && showPassword)) {
      setIsPurplePeeking(false);
      return;
    }

    let peekTimer = 0;
    let resetTimer = 0;

    const schedulePeek = () => {
      peekTimer = window.setTimeout(() => {
        setIsPurplePeeking(true);
        resetTimer = window.setTimeout(() => {
          setIsPurplePeeking(false);
          schedulePeek();
        }, 800);
      }, Math.random() * 3000 + 2000);
    };

    schedulePeek();

    return () => {
      window.clearTimeout(peekTimer);
      window.clearTimeout(resetTimer);
      setIsPurplePeeking(false);
    };
  }, [password.length, showPassword]);

  function calculatePosition(ref: RefObject<HTMLDivElement | null>): Position {
    if (!ref.current) {
      return { faceX: 0, faceY: 0, bodySkew: 0 };
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    };
  }

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);
  const passwordVisible = password.length > 0 && showPassword;
  const passwordHidden = password.length > 0 && !showPassword;

  return (
    <div className="login-art" aria-hidden="true">
      <div className="login-art__brand">
        <div className="login-art__brand-mark">
          <span className="login-art__brand-glyph">✦</span>
        </div>
        <span>Review Ledger</span>
      </div>

      <div className="login-art__characters">
        <div className="login-art__character-stage">
          <div
            ref={purpleRef}
            className="login-character login-character--purple"
            style={{
              left: "70px",
              width: "180px",
              height: isTyping || passwordHidden ? "440px" : "400px",
              transform: passwordVisible
                ? "skewX(0deg)"
                : isTyping || passwordHidden
                  ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
                  : `skewX(${purplePos.bodySkew}deg)`,
            }}
          >
            <div
              className="login-character__eyes"
              style={{
                left: passwordVisible ? "20px" : isLookingAtEachOther ? "55px" : `${45 + purplePos.faceX}px`,
                top: passwordVisible ? "35px" : isLookingAtEachOther ? "65px" : `${40 + purplePos.faceY}px`,
                gap: "32px",
              }}
            >
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                isBlinking={isPurpleBlinking}
                forceLookX={
                  passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
                }
                forceLookY={
                  passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
                }
              />
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                isBlinking={isPurpleBlinking}
                forceLookX={
                  passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
                }
                forceLookY={
                  passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
                }
              />
            </div>
          </div>

          <div
            ref={blackRef}
            className="login-character login-character--black"
            style={{
              left: "240px",
              width: "120px",
              height: "310px",
              transform: passwordVisible
                ? "skewX(0deg)"
                : isLookingAtEachOther
                  ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
                  : isTyping || passwordHidden
                    ? `skewX(${blackPos.bodySkew * 1.5}deg)`
                    : `skewX(${blackPos.bodySkew}deg)`,
            }}
          >
            <div
              className="login-character__eyes"
              style={{
                left: passwordVisible ? "10px" : isLookingAtEachOther ? "32px" : `${26 + blackPos.faceX}px`,
                top: passwordVisible ? "28px" : isLookingAtEachOther ? "12px" : `${32 + blackPos.faceY}px`,
                gap: "24px",
              }}
            >
              <EyeBall
                size={16}
                pupilSize={6}
                maxDistance={4}
                isBlinking={isBlackBlinking}
                forceLookX={passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
              />
              <EyeBall
                size={16}
                pupilSize={6}
                maxDistance={4}
                isBlinking={isBlackBlinking}
                forceLookX={passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
              />
            </div>
          </div>

          <div
            ref={orangeRef}
            className="login-character login-character--orange"
            style={{
              left: "0px",
              width: "240px",
              height: "200px",
              transform: passwordVisible ? "skewX(0deg)" : `skewX(${orangePos.bodySkew}deg)`,
            }}
          >
            <div
              className="login-character__eyes"
              style={{
                left: passwordVisible ? "50px" : `${82 + orangePos.faceX}px`,
                top: passwordVisible ? "85px" : `${90 + orangePos.faceY}px`,
                gap: "32px",
              }}
            >
              <Pupil
                size={12}
                maxDistance={5}
                forceLookX={passwordVisible ? -5 : undefined}
                forceLookY={passwordVisible ? -4 : undefined}
              />
              <Pupil
                size={12}
                maxDistance={5}
                forceLookX={passwordVisible ? -5 : undefined}
                forceLookY={passwordVisible ? -4 : undefined}
              />
            </div>
          </div>

          <div
            ref={yellowRef}
            className="login-character login-character--yellow"
            style={{
              left: "310px",
              width: "140px",
              height: "230px",
              transform: passwordVisible ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew}deg)`,
            }}
          >
            <div
              className="login-character__eyes"
              style={{
                left: passwordVisible ? "20px" : `${52 + yellowPos.faceX}px`,
                top: passwordVisible ? "35px" : `${40 + yellowPos.faceY}px`,
                gap: "24px",
              }}
            >
              <Pupil
                size={12}
                maxDistance={5}
                forceLookX={passwordVisible ? -5 : undefined}
                forceLookY={passwordVisible ? -4 : undefined}
              />
              <Pupil
                size={12}
                maxDistance={5}
                forceLookX={passwordVisible ? -5 : undefined}
                forceLookY={passwordVisible ? -4 : undefined}
              />
            </div>
            <div
              className="login-character__mouth"
              style={{
                left: passwordVisible ? "10px" : `${40 + yellowPos.faceX}px`,
                top: passwordVisible ? "88px" : `${88 + yellowPos.faceY}px`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="login-art__links">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="login-art__grid" />
      <div className="login-art__blur login-art__blur--one" />
      <div className="login-art__blur login-art__blur--two" />
    </div>
  );
}
