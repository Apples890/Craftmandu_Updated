import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline';
  component?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant,
  component,
  className = '',
  children,
  ...props
}) => {
  // Map variants to tailwind classes
  const variantClassMap = {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    h6: 'scroll-m-20 text-base font-semibold tracking-tight',
    body1: 'leading-7 text-base [&:not(:first-child)]:mt-6',
    body2: 'text-sm text-muted-foreground',
    subtitle1: 'text-base font-medium',
    subtitle2: 'text-sm font-medium',
    caption: 'text-xs font-normal text-muted-foreground',
    overline: 'text-xs font-medium uppercase tracking-widest'
  };

  // Map variants to HTML elements if component is not provided
  const variantElementMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body1: 'p',
    body2: 'p',
    subtitle1: 'p',
    subtitle2: 'p',
    caption: 'span',
    overline: 'span',
  };

  const Component = component || variantElementMap[variant];
  const variantClasses = variantClassMap[variant];

  return (
    <Component 
      className={cn(variantClasses, className)} 
      {...props}
    >
      {children}
    </Component>
  );
};

export { Typography };
export type { TypographyProps };