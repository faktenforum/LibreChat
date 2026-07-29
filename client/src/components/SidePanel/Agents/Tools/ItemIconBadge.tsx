import { useState } from 'react';
import type { AgentItem } from './items/types';
import { getIconForItem } from './items/icons';
import { cn } from '~/utils';

interface Props {
  item: AgentItem;
  /** Tile geometry and glyph size; the caller owns layout, this owns appearance. */
  tileClassName: string;
  glyphClassName: string;
}

/**
 * The coloured tile in front of a catalog item.
 *
 * Builtins render a Lucide glyph in an accent-tinted tile. Items that bring their own icon
 * (MCP servers, plugins) used to render as a plain image on white, which left every one of
 * them looking identical and unlike the builtins. A single-colour SVG is therefore drawn as
 * a mask so it picks up the accent colour, giving the same appearance from the same palette;
 * anything else (raster or multi-colour logos) keeps its own pixels on white, and a failed
 * image load falls back to the kind's Lucide glyph.
 */
export default function ItemIconBadge({ item, tileClassName, glyphClassName }: Props) {
  const { Icon, colorClass, iconUrl, tintIcon } = getIconForItem(item);
  const [imgError, setImgError] = useState(false);
  const showImage = iconUrl != null && !imgError;

  if (showImage && tintIcon === true) {
    return (
      <span
        className={cn('flex shrink-0 items-center justify-center', tileClassName, colorClass)}
        aria-hidden="true"
      >
        <span
          className={cn('bg-current', glyphClassName)}
          style={{
            maskImage: `url("${iconUrl}")`,
            WebkitMaskImage: `url("${iconUrl}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      </span>
    );
  }

  if (showImage) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden bg-white',
          tileClassName,
        )}
        aria-hidden="true"
      >
        <img
          src={iconUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={cn('flex shrink-0 items-center justify-center', tileClassName, colorClass)}
      aria-hidden="true"
    >
      <Icon className={glyphClassName} strokeWidth={1.75} />
    </span>
  );
}
