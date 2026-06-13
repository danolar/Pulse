type PulseLogoProps = {
  className?: string;
};

export const PulseLogo = ({ className = "h-11 w-auto sm:h-12" }: PulseLogoProps) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.svg" alt="Pulse" className={`block shrink-0 ${className}`} />
  );
};
