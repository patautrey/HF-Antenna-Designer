export function renderImageCarousel(queries) {
    const params = queries
        .map(q => `i=${encodeURIComponent(q)}`)
        .join("&");

    return `<vs?${params}>`;
}
