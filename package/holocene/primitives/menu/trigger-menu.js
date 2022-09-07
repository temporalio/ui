export const triggerMenu = (node) => {
    const handleTriggerClick = () => {
        node.dispatchEvent(new CustomEvent('toggle-menu'));
    };
    const handleDocumentClick = (event) => {
        var _a;
        let eventTarget = ((_a = event.path) === null || _a === void 0 ? void 0 : _a.length)
            ? event.path[0]
            : event.target;
        if (!eventTarget && event.relatedTarget)
            eventTarget = event.relatedTarget;
        if (node && !node.contains(eventTarget)) {
            node.dispatchEvent(new CustomEvent('close-menu'));
            event.stopPropagation();
        }
    };
    const handleKeyUp = (event) => {
        if ((event === null || event === void 0 ? void 0 : event.key) === 'Escape') {
            node.dispatchEvent(new CustomEvent('close-menu'));
        }
    };
    node.setAttribute('tabindex', '0');
    node.addEventListener('click', handleTriggerClick, false);
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('keyup', handleKeyUp, false);
    return {
        destroy() {
            node.removeEventListener('click', handleTriggerClick, false);
            document.removeEventListener('click', handleDocumentClick, false);
            document.removeEventListener('keyup', handleKeyUp, false);
        },
    };
};
