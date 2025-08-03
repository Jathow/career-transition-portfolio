import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Box, Skeleton } from '@mui/material';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  effect?: 'blur' | 'opacity' | 'black-and-white';
  placeholder?: React.ReactElement;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  effect = 'blur',
  placeholder,
  threshold = 100,
  className,
  style,
}) => {
  const defaultPlaceholder = (
    <Skeleton
      variant="rectangular"
      width={width || '100%'}
      height={height || 200}
      animation="wave"
    />
  );

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <LazyLoadImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        effect={effect}
        placeholder={placeholder || defaultPlaceholder}
        threshold={threshold}
        className={className}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          ...style,
        }}
        wrapperClassName="lazy-image-wrapper"
      />
    </Box>
  );
};

export default LazyImage; 