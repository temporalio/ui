export const getLastEvent = ({ events }) => {
    let latestEventKey = 0;
    let result;
    for (const event of events.values()) {
        const k = Number(event.id);
        if (k >= latestEventKey) {
            latestEventKey = k;
            result = event;
        }
    }
    return result;
};
