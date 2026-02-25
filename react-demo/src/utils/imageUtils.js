import BASE_URL from "../api/ApiConstant";

export const getThumbnailSrc = (thumbnail) => {
    if (!thumbnail) return "/no-image.png";
    return thumbnail.startsWith("http")
        ? thumbnail
        : `${BASE_URL}${thumbnail}`;
};
