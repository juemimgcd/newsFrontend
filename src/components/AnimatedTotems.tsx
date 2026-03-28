import { useEffect, useState } from "react";

type ActiveField = "username" | "password" | null;

interface AnimatedTotemsProps {
  activeField: ActiveField;
  showPassword: boolean;
  passwordLength: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface EyeSetProps {
  x: number;
  y: number;
  covered?: boolean;
}

function EyeSet({ x, y, covered = false }: EyeSetProps) {
  return (
    <div className={`eyes ${covered ? "eyes--covered" : ""}`}>
      <span className="eye">
        <span className="pupil" style={{ transform: `translate(${x}px, ${y}px)` }} />
      </span>
      <span className="eye">
        <span className="pupil" style={{ transform: `translate(${x}px, ${y}px)` }} />
      </span>
    </div>
  );
}

export function AnimatedTotems({
  activeField,
  showPassword,
  passwordLength,
}: AnimatedTotemsProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nextX = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      const nextY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      setPointer({ x: nextX, y: nextY });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const usernameFocus = activeField === "username";
  const passwordFocus = activeField === "password";
  const hidingPassword = passwordFocus && passwordLength > 0 && !showPassword;
  const peekingPassword = passwordFocus && passwordLength > 0 && showPassword;

  const look = (multiplier = 1) => {
    const x = clamp(pointer.x * 6 * multiplier + (usernameFocus ? 2.5 : 0), -8, 8);
    const y = clamp(pointer.y * 4 * multiplier + (passwordFocus ? -2 : 0), -6, 6);
    return { x, y };
  };

  const lookSoft = look(0.7);
  const lookBold = look(1.15);
  const lookTiny = look(0.45);

  return (
    <div className="totem-stage" aria-hidden="true">
      <div className="totem-grid" />

      <div
        className="totem totem--ink"
        style={{
          transform: `translate(${pointer.x * 14}px, ${pointer.y * 6}px) skewX(${
            usernameFocus ? -5 : 3
          }deg)`,
        }}
      >
        <div className="totem-head">
          <EyeSet x={lookSoft.x} y={lookSoft.y} covered={false} />
        </div>
      </div>

      <div
        className="totem totem--sage"
        style={{
          transform: `translate(${pointer.x * -10}px, ${pointer.y * 10}px) skewX(${
            passwordFocus ? 5 : -2
          }deg)`,
        }}
      >
        <div className="totem-head">
          <EyeSet x={lookTiny.x} y={lookTiny.y} covered={hidingPassword} />
        </div>
        <div className={`totem-sleeve ${hidingPassword ? "totem-sleeve--raised" : ""}`} />
      </div>

      <div
        className="totem totem--paper"
        style={{
          transform: `translate(${pointer.x * 16}px, ${pointer.y * -8}px) rotate(${
            usernameFocus ? -4 : 0
          }deg)`,
        }}
      >
        <div className="totem-head">
          <EyeSet x={lookBold.x} y={lookBold.y} covered={hidingPassword && !peekingPassword} />
        </div>
        <div
          className={`totem-sleeve totem-sleeve--paper ${
            hidingPassword || peekingPassword ? "totem-sleeve--raised" : ""
          } ${peekingPassword ? "totem-sleeve--peek" : ""}`}
        />
      </div>

      <div
        className="totem totem--brass"
        style={{
          transform: `translate(${pointer.x * -18}px, ${pointer.y * -4}px) skewX(${
            peekingPassword ? 0 : 6
          }deg)`,
        }}
      >
        <div className="totem-head">
          <EyeSet x={lookTiny.x - 1} y={lookTiny.y - 1} covered={false} />
          <span className="totem-mouth" />
        </div>
      </div>

      <div className="totem-caption">
        <span className="capsule">Animated newsroom figures</span>
        <p>
          The characters watch the cursor, lean in on <strong>username</strong>, and shield
          themselves when the password stays hidden.
        </p>
      </div>
    </div>
  );
}
