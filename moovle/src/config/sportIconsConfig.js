import {
  RunningIcon,
  CyclingIcon,
  WalkingIcon,
  TennisIcon,
  PadelIcon,
  SwimmingIcon,
} from "./sportIcons.jsx";

// Non-component exports for sport icons configuration
export const sportIcons = {
  running: RunningIcon,
  cycling: CyclingIcon,
  walking: WalkingIcon,
  tennis: TennisIcon,
  padel: PadelIcon,
  swimming: SwimmingIcon,
};

export function getSportIconComponent(id) {
  return sportIcons[id] || RunningIcon;
}

// Backward compatibility exports (for any existing usage)
export const Running = RunningIcon;
export const Cycling = CyclingIcon;
export const Walking = WalkingIcon;
export const Tennis = TennisIcon;
export const Padel = PadelIcon;
