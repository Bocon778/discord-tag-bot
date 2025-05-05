# unnamed tag bot
a simple, fast tag bot
> [!NOTE]
> This bot is still in development; there may be vulnerabilities or unpatched bugs
## Customization
To edit tags, edit `data/tags.json`. You can use the tags already present in this repo as an example.

## Hosting
you can simply use the files in this repo for your own projects by doing the following:
- uploading the files in this repoistry to your host
- editing `data/tags.json` to include your tags
- adding a `config.json` like so:
```
{
    "token": "BOT_TOKEN",
    "clientId": "APPLICATION_ID",
    "ownerId": "YOUR_ID"
}
```
you only really need your token and owner ID; client ID is only used to deploy commands. You can also set these:
- `debug=[boolean]` (uses the following instead of the defaults if true):
- `debugtoken=[DEBUG_BOT_TOKEN]`
- `debugclientId=[DEBUG_BOT_APPLICATION_ID]`
