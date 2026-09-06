import React, { useState } from 'react';

export const ReadMoreText = ({ text, maxLines = 3, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <span className="text-muted-foreground italic text-sm">No description available.</span>;

  const style = !isExpanded 
    ? { 
        display: '-webkit-box', 
        WebkitLineClamp: maxLines, 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden' 
      } 
    : {};

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <p className="text-sm text-muted-foreground" style={style}>
        {text}
      </p>
      {text.length > 120 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-primary font-bold hover:underline mt-1 cursor-pointer"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};
