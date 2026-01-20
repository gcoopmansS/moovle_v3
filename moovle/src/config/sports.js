/**
 * Sports Configuration
 *
 * Each sport can have the following properties:
 * - id: Unique identifier (used in database)
 * - label: Display name
 * - icon: Custom SVG icon component
 * - supportsDistance: Whether users can specify distance instead of duration
 * - defaultDistance: Default distance placeholder (in km) if supportsDistance is true
 * - defaultDuration: Default duration value (in minutes)
 */

import {
  RunningIcon,
  CyclingIcon,
  WalkingIcon,
  TennisIcon,
  PadelIcon,
  SwimmingIcon,
} from "./sportIcons.jsx";

export const sports = [
  {
    id: "running",
    label: "Running",
    icon: RunningIcon,
    supportsDistance: true,
    defaultDistance: 5,
    defaultDuration: 30,
    capacityOptions: Array.from({ length: 19 }, (_, i) => i + 2), // 2-20
  },
  {
    id: "cycling",
    label: "Cycling",
    icon: CyclingIcon,
    supportsDistance: true,
    defaultDistance: 20,
    defaultDuration: 60,
    capacityOptions: Array.from({ length: 19 }, (_, i) => i + 2), // 2-20
  },
  {
    id: "walking",
    label: "Walking",
    icon: WalkingIcon,
    supportsDistance: true,
    defaultDistance: 5,
    defaultDuration: 60,
    capacityOptions: Array.from({ length: 19 }, (_, i) => i + 2), // 2-20
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: TennisIcon,
    supportsDistance: false,
    defaultDuration: 60,
    capacityOptions: [2, 4],
  },
  {
    id: "padel",
    label: "Padel",
    icon: PadelIcon,
    supportsDistance: false,
    defaultDuration: 60,
    capacityOptions: [2, 4],
  },
  {
    id: "swimming",
    label: "Swimming",
    icon: SwimmingIcon,
    supportsDistance: true,
    defaultDistance: 1,
    defaultDuration: 45,
    capacityOptions: Array.from({ length: 19 }, (_, i) => i + 2), // 2-20
  },
];

// Helper functions
export const getSportById = (id) => sports.find((s) => s.id === id);

export const getSportIcon = (id) => {
  const sport = getSportById(id);
  return sport?.icon || RunningIcon;
};

export const getSportLabel = (id) => {
  const sport = getSportById(id);
  return sport?.label || id;
};

// Helper to get sport icon props for consistent styling
export const getSportIconProps = (
  id,
  { size = 16, className = "text-slate-600" } = {},
) => {
  const IconComponent = getSportIcon(id);
  return { IconComponent, size, className };
};

// Duration options in minutes (value stored in DB) with display labels
export const durations = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2.5 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 360, label: "Half day" },
  { value: 480, label: "Full day" },
];

// Helper to format duration for display
export const formatDuration = (minutes) => {
  if (!minutes) return "";
  const duration = durations.find((d) => d.value === minutes);
  if (duration) return duration.label;

  // Fallback for custom values
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${mins}m`;
};

// Visibility options
export const visibilityOptions = [
  {
    id: "public",
    label: "Public",
    description: "Anyone can see and join",
  },
  {
    id: "mates",
    label: "Mates Only",
    description: "Only your mates can see and join",
  },
  {
    id: "invite_only",
    label: "Invite Only",
    description: "Only people you invite can join",
  },
];
