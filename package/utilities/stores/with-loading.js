export const delay = 300;
export const withLoading = async (loading, updating, fn) => {
    updating.set(true);
    try {
        await fn();
    }
    catch (error) {
        console.error(error);
    }
    loading.set(false);
    setTimeout(() => {
        updating.set(false);
    }, delay);
};
