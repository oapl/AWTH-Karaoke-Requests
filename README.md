# Apocalypse with the Hips

Static GitHub Pages site for karaoke track requests and queue status.

## Files

- `index.html` is the page.
- `styles.css` is the layout and visual design.
- `app.js` posts requests to the existing Google Form and renders the queue.
- `data/queue.csv` is the default queue data source.
- `assets/karaoke-stage.webp` is the optimized hero image.
- `CNAME` points GitHub Pages at `ApocalypseWithTheHips.com`.

## Request Form

The custom form posts into the existing Google Form:

- Artist / Song: `entry.1419360541`
- Contact: `entry.1825989671`

If the Google Form changes, update those field names in `index.html`.

## Queue Data

The queue table reads `data/queue.csv` by default. Keep the public queue columns simple:

```csv
artist_song,status,updated,notes
Tom Cardy - Business Man,Making,2026-06-09,Need instrumental pass.
```

You can also point the page at a published Google Sheet CSV by changing this line in `app.js`:

```js
const QUEUE_CSV_URL = window.APOTH_QUEUE_CSV_URL || "./data/queue.csv";
```

Use a public queue tab that does not include requester contact info.

## GitHub Pages

1. Create a GitHub repository.
2. Put the contents of this folder at the repository root.
3. Commit and push to the default branch.
4. In GitHub, go to Settings > Pages and deploy from the default branch root.
5. In the Pages custom domain field, use `ApocalypseWithTheHips.com`.
6. Keep the `CNAME` file in the repo.

Official GitHub Pages custom-domain docs:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## DNS

For the apex domain, create `A` records pointing to GitHub Pages:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

For `www`, create a `CNAME` record pointing to your GitHub Pages hostname:

```text
YOUR-GITHUB-USERNAME.github.io
```

After DNS resolves, enable Enforce HTTPS in the GitHub Pages settings.
