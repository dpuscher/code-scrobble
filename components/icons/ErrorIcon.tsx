import { TriangleAlert } from "lucide-react";

interface ErrorIconProps {
  color?: string;
  size?: number;
  className?: string;
}

const ErrorIcon = ({ color = "#000", size = 100, className }: ErrorIconProps) => (
  <TriangleAlert color={color} size={size} className={className} aria-hidden="true" />
);

export default ErrorIcon;
