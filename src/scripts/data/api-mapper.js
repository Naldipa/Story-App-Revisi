import Map from "../../scripts/utils/map";

export async function storyMapper(story) {
  return {
    ...story,
    placeName: await Map.getPlaceNameByCoordinate(story.lat, story.lon),
  };
}
