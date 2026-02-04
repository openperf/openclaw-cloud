import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
    xl: "h-11 w-11",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <img 
          src="/horse-logo.png" 
          alt="OpenClaw Logo" 
          className={cn(sizeClasses[size], "object-contain")}
        />
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight", textSizeClasses[size])}>
          <span className="stripe-gradient-text">Open</span>
          <span className="text-foreground">Claw</span>
          <span className="text-muted-foreground font-normal ml-1.5 text-[0.85em]">Cloud</span>
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };
  return (
    <img 
      src="/horse-logo.png" 
      alt="OpenClaw Logo" 
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  );
}
