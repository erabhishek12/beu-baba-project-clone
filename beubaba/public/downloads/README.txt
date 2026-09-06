PUT YOUR APK HERE
=================

Drop the release APK in this folder and name it exactly:

    beubaba.apk

Full path:  beubaba/public/downloads/beubaba.apk

After deploying, the download link becomes:
    https://<your-domain>/downloads/beubaba.apk

Clicking "Download" on the promo site starts the download immediately —
no extra page, no redirect.

If you prefer a different filename or an external host (Google Drive,
GitHub Releases), set this instead and the button will use it:

    VITE_ANDROID_DOWNLOAD_URL=https://your-link-here

NOTE: some hosts serve .apk as plain text instead of downloading it.
The button uses the HTML `download` attribute, which handles that for
same-origin files like this one.
