export const getStatusFilterCode = (status) => {
    if (status === 'Running')
        return '1';
    if (status === 'Completed')
        return '2';
    if (status === 'Failed')
        return '3';
    if (status === 'Canceled')
        return '4';
    if (status === 'Terminated')
        return '5';
    if (status === 'ContinuedAsNew')
        return '6';
    if (status === 'TimedOut')
        return '7';
};
