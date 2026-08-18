import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(fetchRecipes);
 *   const { data, loading, error, refetch } = useApi(() => fetchMealPlan(userId), [userId]);
 */
export function useApi(fetchFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}