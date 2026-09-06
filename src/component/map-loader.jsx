import React, { useState } from 'react';

const MapLoader = ({ src, className, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!isLoaded && (
                <div className="skeleton absolute inset-0 z-10 w-full h-full rounded-xl" />
            )}
            <iframe
                src={src}
                className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                {...props}
            />
        </div>
    );
};

export default MapLoader;
