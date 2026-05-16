# Province Media Assets

Add province-specific dance media in this folder using the province id from the app route.

Flags are now stored in one shared folder:

```text
public/media/province-flags
```

Expected structure:

```text
public/media/provinces/central/dance.mp4
public/media/provinces/central/dance.gif
```

Supported dashboard files:

- `dance.mp4` for the looping dance background.
- `dance.gif` as a fallback when a video file is not available.

Recommended dance video settings:

- 8 to 15 second loop
- muted-friendly footage, because browsers autoplay only muted video
- 1280x720 or 1920x1080
- under 15 MB where possible
- culturally accurate dress and dance for that province
- rights cleared for use in this project

If a file is missing, the dashboard still works. It falls back to generated flag colors and the existing animated dancer silhouettes.

## Dance Video Folders

Put each province's short cultural dance video in its matching folder and name it `dance.mp4`.

Optional fallback file: `dance.gif`.

Hela, Enga, and Southern Highlands currently have `dance.mp4` files installed.

```text
public/media/provinces/central/dance.mp4
public/media/provinces/chimbu/dance.mp4
public/media/provinces/east-new-britain/dance.mp4
public/media/provinces/east-sepik/dance.mp4
public/media/provinces/eastern-highlands/dance.mp4
public/media/provinces/enga/dance.mp4
public/media/provinces/gulf/dance.mp4
public/media/provinces/hela/dance.mp4
public/media/provinces/jiwaka/dance.mp4
public/media/provinces/madang/dance.mp4
public/media/provinces/manus/dance.mp4
public/media/provinces/milne-bay/dance.mp4
public/media/provinces/morobe/dance.mp4
public/media/provinces/national-capital/dance.mp4
public/media/provinces/new-ireland/dance.mp4
public/media/provinces/north-solomons/dance.mp4
public/media/provinces/oro/dance.mp4
public/media/provinces/sandaun/dance.mp4
public/media/provinces/southern-highlands/dance.mp4
public/media/provinces/west-new-britain/dance.mp4
public/media/provinces/western/dance.mp4
public/media/provinces/western-highlands/dance.mp4
```
