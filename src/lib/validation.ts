const URL_REGEX = new RegExp("https:\/\/([\w\.-]{3}\.)?horsepaste\.com\/");

export function isValidCodenamesUrl(url: string) {
    return URL_REGEX.test(url);
}