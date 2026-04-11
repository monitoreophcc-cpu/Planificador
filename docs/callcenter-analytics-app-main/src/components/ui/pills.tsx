'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type PillToggleContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const PillToggleContainer = ({
  children,
  className,
}: PillToggleContainerProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-muted p-1 text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
};

type PillButtonProps = {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
};

export const PillButton = ({ onClick, isActive, children }: PillButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'rounded-full h-auto px-4 py-1.5 text-xs font-bold transition-all duration-200',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-background text-foreground shadow-sm scale-105'
          : 'hover:bg-background/60 text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Button>
  );
};
