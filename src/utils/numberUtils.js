export const addComma = (num) => {
    if (num == null) return '';
    const [intPart, decPart] = num.toString().split('.');
    const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${withComma}.${decPart}` : withComma;
};