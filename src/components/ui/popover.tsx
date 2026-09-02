'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

type PopoverLabellingContextValue = {
  triggerId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: () => () => void;
  registerDescription: () => () => void;
};

const PopoverLabellingContext =
  React.createContext<PopoverLabellingContextValue | null>(null);

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const id = React.useId();
  const [titleCount, setTitleCount] = React.useState(0);
  const [descriptionCount, setDescriptionCount] = React.useState(0);

  const registerTitle = React.useCallback(() => {
    setTitleCount((current) => current + 1);
    return () => setTitleCount((current) => current - 1);
  }, []);

  const registerDescription = React.useCallback(() => {
    setDescriptionCount((current) => current + 1);
    return () => setDescriptionCount((current) => current - 1);
  }, []);

  const labelling = React.useMemo<PopoverLabellingContextValue>(
    () => ({
      triggerId: `${id}-trigger`,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      hasTitle: titleCount > 0,
      hasDescription: descriptionCount > 0,
      registerTitle,
      registerDescription,
    }),
    [descriptionCount, id, registerDescription, registerTitle, titleCount],
  );

  return (
    <PopoverLabellingContext.Provider value={labelling}>
      <PopoverPrimitive.Root data-slot="popover" {...props} />
    </PopoverLabellingContext.Provider>
  );
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const labelling = React.useContext(PopoverLabellingContext);

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      id={labelling?.triggerId}
      {...props}
    />
  );
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const labelling = React.useContext(PopoverLabellingContext);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        aria-labelledby={
          labelling?.hasTitle ? labelling.titleId : labelling?.triggerId
        }
        aria-describedby={
          labelling?.hasDescription ? labelling.descriptionId : undefined
        }
        className={cn(
          'bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-1 text-sm', className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  const labelling = React.useContext(PopoverLabellingContext);
  const registerTitle = labelling?.registerTitle;

  React.useEffect(() => registerTitle?.(), [registerTitle]);

  return (
    <h2
      data-slot="popover-title"
      id={labelling?.titleId}
      className={cn('font-medium', className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  const labelling = React.useContext(PopoverLabellingContext);
  const registerDescription = labelling?.registerDescription;

  React.useEffect(() => registerDescription?.(), [registerDescription]);

  return (
    <p
      data-slot="popover-description"
      id={labelling?.descriptionId}
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
