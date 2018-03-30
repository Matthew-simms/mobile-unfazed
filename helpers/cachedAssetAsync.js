import { Asset, Font } from 'expo';

export default function cacheAssetsAsync({
  images = [],
  fonts = [],
  videos = [],
}) {
  return Promise.all([
    ...cacheImages(images),
    ...cacheFonts(fonts),
    ...cacheVideos(videos),
  ]);
}

function cacheImages(images) {
  return images.map(image => Asset.fromModule(image).downloadAsync());
}

function cacheVideos(videos) {
  return videos.map(video => Asset.fromModule(video).downloadAsync());
}

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}