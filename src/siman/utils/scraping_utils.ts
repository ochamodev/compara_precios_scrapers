
export function getProductSku(link: String | null) {
    if (!link) {
        throw new Error("Link is null");
    }
    const tokens = link.split('-');
    const skuPart = tokens[tokens.length - 1].split('/')[0];
    return skuPart;
}
