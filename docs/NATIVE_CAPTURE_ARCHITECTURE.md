# Native Capture Architecture

## Implemented now

SideQuest has one normalized capture-input contract for title text, URLs, shared text, images, and optional source metadata. The web Quick Capture flow uses the same defaults and save path as all other Quest creation.

## Prepared interfaces

A future native bridge may provide:

- `url`
- `title`
- `text`
- `image`
- `sourceApp`

Input must be normalized before entering the existing editor. Authentication and Space selection remain authoritative inside SideQuest. Receiving input must never save automatically.

## Future native work

- Android Sharesheet intent handling
- iOS Share Extension
- Universal Links and Android App Links
- secure authentication handoff
- native image URI conversion
- destination Space picker in the native handoff

No native extension or background upload is implemented in this phase.

