declare module 'react-puzzle-captcha' {
  import React from 'react';

  export interface VerifyProps {
    width?: number;
    height?: number;
    l?: number;
    r?: number;
    imgUrl?: string;
    text?: string;
    refreshIcon?: string;
    visible?: boolean;
    onDraw?: (distance: number) => void;
    onCustomverify?: () => any;
    onSuccess?: () => void;
    onFail?: () => void;
    onRefresh?: () => void;
  }

  export const Verify: React.FC<VerifyProps>;

  const PuzzleCaptcha: React.FC<VerifyProps>;
  export default PuzzleCaptcha;
}
