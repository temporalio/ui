export const getFloatStyle = ({ width, height, screenWidth, breakpoint = 1024, }) => {
    return width && height && screenWidth > breakpoint
        ? `position: absolute; right: ${width + 20}px; top: -${height + 14}px`
        : '';
};
