const getHeaders: HeadersInit = {
    Accept: "application/json, text/plain, */*",
};

const postHeaders: HeadersInit = {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
};

export type RequestType = "GET" | "PUT";

function buildOptions<T>(method: RequestType, headers: HeadersInit, entityBytes: T) {
    const result: RequestInit = { method, headers, body: null };

    if (entityBytes != null) {
        result.body = JSON.stringify(entityBytes);
    }
    return result;
}

export function getRequest<R>(url: string): Promise<R | undefined> {
    const options = buildOptions("GET", getHeaders, null);
    return handleFetch(fetch(url, options));
}

export function putRequest<R, T>(url: string, object: T): Promise<R | undefined> {
    const options = buildOptions("PUT", postHeaders, object);
    return handleFetch(fetch(url, options));
}

function handleFetch<T>(promise: Promise<Response>): Promise<T | undefined> {
    return promise
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return undefined;
            }
        })
        .catch(() => undefined);
}